import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Wallet, Target, TrendingUp, Trash2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Transaction {
  type: "income" | "expense";
  desc: string;
  amount: number;
  time: string;
}

interface BudgetGoal {
  name: string;
  current: number;
  target: number;
  category: string;
}

export function BudgetSection() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgetGoals, setBudgetGoals] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  // Load data from Supabase
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load or create user profile
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create one with initial data
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'User',
            monthly_income: 2500,
            total_expenses: 1850,
            savings: 650
          })
          .select()
          .single();

        if (createError) throw createError;
        profile = newProfile;

        // Add initial transactions
        await supabase.from('transactions').insert([
          { user_id: user.id, type: 'income', amount: 625, description: 'Weekly Salary', category: 'salary' },
          { user_id: user.id, type: 'expense', amount: 85, description: 'Groceries at Stop & Shop', category: 'food' },
          { user_id: user.id, type: 'expense', amount: 15, description: 'PMV Transport', category: 'transport' },
          { user_id: user.id, type: 'income', amount: 120, description: 'Market Sales', category: 'business' }
        ]);

        // Add initial budget goals
        await supabase.from('budget_goals').insert([
          { user_id: user.id, name: 'Food & Groceries', target_amount: 800, used_amount: 600 },
          { user_id: user.id, name: 'Transportation', target_amount: 300, used_amount: 200 },
          { user_id: user.id, name: 'Education Savings', target_amount: 200, used_amount: 150 }
        ]);
      }

      setUserProfile(profile);

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

      // Load budget goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('budget_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;
      setBudgetGoals(goalsData || []);

    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error Loading Data",
        description: "There was an error loading your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  // Calculate monthly income and expenses from actual transactions
  const monthlyIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const savings = monthlyIncome - totalExpenses;

  const handleAddIncome = async () => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please enter a description",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    try {
      // Add transaction to database
      const { data: newTransaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'income',
          amount: amountNum,
          description: description,
          category: 'income'
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update budget goals if description matches a goal name (works for both income and expenses)
      const desc = description.toLowerCase();
      let updatedGoals = [...budgetGoals];
      let goalUpdated = false;

      // Check for exact matches or partial matches in goal names
      for (let i = 0; i < updatedGoals.length; i++) {
        const goal = updatedGoals[i];
        const goalName = goal.name.toLowerCase();
        
        // Check for various matching criteria
        if (goalName.includes(desc) || 
            desc.includes(goalName) ||
            (goalName.includes("food") && (desc.includes("food") || desc.includes("groceries") || desc.includes("meal"))) ||
            (goalName.includes("transport") && (desc.includes("transport") || desc.includes("pmv") || desc.includes("bus") || desc.includes("taxi"))) ||
            (goalName.includes("education") && (desc.includes("education") || desc.includes("school") || desc.includes("course") || desc.includes("fee"))) ||
            (goalName.includes("entertainment") && (desc.includes("entertainment") || desc.includes("movie") || desc.includes("game"))) ||
            (goalName.includes("health") && (desc.includes("health") || desc.includes("medical") || desc.includes("doctor"))) ||
            (goalName.includes("shopping") && (desc.includes("shopping") || desc.includes("clothes") || desc.includes("buy")))) {
          
          const newUsedAmount = goal.used_amount + amountNum;
          updatedGoals[i] = { ...goal, used_amount: newUsedAmount };
          goalUpdated = true;
          
          // Update in database
          await supabase
            .from('budget_goals')
            .update({ used_amount: newUsedAmount })
            .eq('id', goal.id);
          
          break; // Only update the first matching goal
        }
      }

      // Update local state
      setTransactions(prev => [newTransaction, ...prev]);
      if (goalUpdated) {
        setBudgetGoals(updatedGoals);
      }

      setAmount("");
      setDescription("");
      
      toast({
        title: "Income Added!",
        description: `K ${amountNum} added to your income`,
      });
    } catch (error) {
      console.error('Error adding income:', error);
      toast({
        title: "Error",
        description: "There was an error adding your income. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddExpense = async () => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please enter a description",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    try {
      // Add transaction to database
      const { data: newTransaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'expense',
          amount: amountNum,
          description: description,
          category: 'expense'
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update budget goals if description matches a goal name (works for both income and expenses)
      const desc = description.toLowerCase();
      let updatedGoals = [...budgetGoals];
      let goalUpdated = false;

      // Check for exact matches or partial matches in goal names
      for (let i = 0; i < updatedGoals.length; i++) {
        const goal = updatedGoals[i];
        const goalName = goal.name.toLowerCase();
        
        // Check for various matching criteria
        if (goalName.includes(desc) || 
            desc.includes(goalName) ||
            (goalName.includes("food") && (desc.includes("food") || desc.includes("groceries") || desc.includes("meal"))) ||
            (goalName.includes("transport") && (desc.includes("transport") || desc.includes("pmv") || desc.includes("bus") || desc.includes("taxi"))) ||
            (goalName.includes("education") && (desc.includes("education") || desc.includes("school") || desc.includes("course") || desc.includes("fee"))) ||
            (goalName.includes("entertainment") && (desc.includes("entertainment") || desc.includes("movie") || desc.includes("game"))) ||
            (goalName.includes("health") && (desc.includes("health") || desc.includes("medical") || desc.includes("doctor"))) ||
            (goalName.includes("shopping") && (desc.includes("shopping") || desc.includes("clothes") || desc.includes("buy")))) {
          
          const newUsedAmount = goal.used_amount + amountNum;
          updatedGoals[i] = { ...goal, used_amount: newUsedAmount };
          goalUpdated = true;
          
          // Update in database
          await supabase
            .from('budget_goals')
            .update({ used_amount: newUsedAmount })
            .eq('id', goal.id);
          
          break; // Only update the first matching goal
        }
      }

      // Update local state
      setTransactions(prev => [newTransaction, ...prev]);
      if (goalUpdated) {
        setBudgetGoals(updatedGoals);
      }

      setAmount("");
      setDescription("");
      
      toast({
        title: "Expense Added!",
        description: `K ${amountNum} added to your expenses`,
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "There was an error adding your expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetNewGoal = async () => {
    const targetNum = parseFloat(newGoalTarget);
    if (!newGoalName.trim() || !newGoalTarget || isNaN(targetNum) || targetNum <= 0) {
      toast({
        title: "Invalid Goal",
        description: "Please enter a valid goal name and target amount",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    try {
      const { data: newGoal, error } = await supabase
        .from('budget_goals')
        .insert({
          user_id: user.id,
          name: newGoalName,
          target_amount: targetNum,
          used_amount: 0
        })
        .select()
        .single();

      if (error) throw error;

      setBudgetGoals(prev => [newGoal, ...prev]);

      setNewGoalName("");
      setNewGoalTarget("");
      setIsGoalDialogOpen(false);
      
      toast({
        title: "New Goal Set!",
        description: `Goal "${newGoalName}" created with target K ${targetNum}`,
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "There was an error creating your goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budget_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      setBudgetGoals(prev => prev.filter(goal => goal.id !== goalId));
      
      toast({
        title: "Goal Deleted",
        description: "Budget goal has been successfully deleted",
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "There was an error deleting your goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">My Budget</h2>
        <p className="text-muted-foreground">
          Take control of your finances and plan for your future
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-success text-success-foreground">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Monthly Income</p>
                <p className="text-2xl font-bold">K {monthlyIncome.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-primary text-primary-foreground">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Total Expenses</p>
                <p className="text-2xl font-bold">K {totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary text-accent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Savings</p>
                <p className="text-2xl font-bold">K {savings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add Income/Expense */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Quick Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Kina)</Label>
              <Input 
                id="amount" 
                type="number"
                placeholder="Enter amount..." 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                placeholder="What was this for?" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="success" className="flex-1" onClick={handleAddIncome}>
                Add Income
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleAddExpense}>
                Add Expense
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Budget Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetGoals.map((goal, index) => {
              const percentage = Math.min((goal.used_amount / goal.target_amount) * 100, 100);
              const isOverBudget = goal.used_amount > goal.target_amount;
              
              return (
                <div key={goal.id || index} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>{goal.name}</span>
                    <div className="flex items-center gap-2">
                      <span>K {goal.used_amount} / K {goal.target_amount}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <Badge 
                    variant={isOverBudget ? "destructive" : "secondary"} 
                    className="text-xs"
                  >
                    {Math.round(percentage)}% {goal.name.toLowerCase().includes("savings") ? "saved" : "used"}
                    {isOverBudget && " (Over Budget!)"}
                  </Badge>
                </div>
              );
            })}

            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient" className="w-full">
                  Set New Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Budget Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goalName">Goal Name</Label>
                    <Input 
                      id="goalName"
                      placeholder="e.g., Emergency Fund"
                      value={newGoalName}
                      onChange={(e) => setNewGoalName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goalTarget">Target Amount (Kina)</Label>
                    <Input 
                      id="goalTarget"
                      type="number"
                      placeholder="Enter target amount"
                      value={newGoalTarget}
                      onChange={(e) => setNewGoalTarget(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setIsGoalDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={handleSetNewGoal}>
                      Create Goal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No transactions yet</div>
            ) : (
              <>
                {(showAllTransactions ? transactions : transactions.slice(0, 10)).map((transaction, index) => (
                  <div key={transaction.id || index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{formatTimeAgo(transaction.created_at)}</p>
                    </div>
                    <span className={`font-bold ${
                      transaction.type === "income" ? "text-success" : "text-destructive"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}K {transaction.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                
                {transactions.length > 10 && !showAllTransactions && (
                  <Button
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={() => setShowAllTransactions(true)}
                  >
                    <ChevronDown className="h-4 w-4 mr-2" />
                    See More ({transactions.length - 10} more transactions)
                  </Button>
                )}
                
                {showAllTransactions && transactions.length > 10 && (
                  <Button
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={() => setShowAllTransactions(false)}
                  >
                    Show Less
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Moved community banner */}
      <Card className="bg-gradient-secondary">
        <CardContent className="p-4 text-center">
          <p className="text-sm font-medium text-accent">
            Empowering PNG Communities
          </p>
          <p className="text-xs text-accent/80 mt-1">
            Together we build financial literacy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}