import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, BookOpen, Award, Target, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function LearnSection() {
  const { t } = useLanguage();
  
  const courses = [
    { 
      title: "Budgeting Basics", 
      duration: "15 min", 
      progress: 80, 
      level: "Beginner",
      description: "Learn how to create and manage a personal budget"
    },
    { 
      title: "Understanding Inflation", 
      duration: "12 min", 
      progress: 45, 
      level: "Intermediate",
      description: "Why prices change and how it affects your money"
    },
    { 
      title: "Saving Strategies", 
      duration: "18 min", 
      progress: 0, 
      level: "Beginner",
      description: "Practical tips for building your savings"
    },
    { 
      title: "Market Economics in PNG", 
      duration: "25 min", 
      progress: 100, 
      level: "Advanced",
      description: "Understanding local market forces and pricing"
    },
  ];

  const achievements = [
    { title: "Budget Master", earned: true, description: "Completed budgeting course" },
    { title: "Market Watcher", earned: true, description: "Added 5 price reports" },
    { title: "Community Helper", earned: false, description: "Help 10 people with price info" },
    { title: "Financial Guru", earned: false, description: "Complete all courses" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">{t('learn.title')}</h2>
        <p className="text-muted-foreground">
          {t('learn.subtitle')}
        </p>
      </div>

      {/* Learning Progress */}
      <Card className="bg-gradient-success text-success-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">{t('learn.journey.title')}</h3>
              <p className="opacity-90">{t('learn.journey.subtitle')}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">65%</p>
              <p className="text-sm opacity-90">{t('learn.journey.complete')}</p>
            </div>
          </div>
          <Progress value={65} className="h-3 bg-success-foreground/20" />
        </CardContent>
      </Card>

      {/* Course Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {courses.map((course, index) => (
          <Card key={index} className="hover:shadow-card transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                </div>
                <Badge variant={course.level === "Beginner" ? "secondary" : course.level === "Intermediate" ? "default" : "destructive"}>
                  {course.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {course.duration}
              </div>
              
              {course.progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('learn.course.progress')}</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              )}

              <Button 
                variant={course.progress === 100 ? "success" : "hero"} 
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {course.progress === 0 ? t('learn.course.start') : 
                 course.progress === 100 ? t('learn.course.review') : t('learn.course.continue')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {t('learn.achievements.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                achievement.earned 
                  ? "bg-gradient-secondary text-accent border-secondary" 
                  : "bg-muted border-border"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    achievement.earned ? "bg-accent text-accent-foreground" : "bg-muted-foreground/20"
                  }`}>
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`font-medium ${achievement.earned ? "" : "text-muted-foreground"}`}>
                      {achievement.title}
                    </p>
                    <p className={`text-xs ${achievement.earned ? "opacity-80" : "text-muted-foreground"}`}>
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Challenge */}
      <Card className="bg-gradient-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('learn.challenge.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">{t('learn.challenge.name')}</h4>
              <p className="text-sm opacity-90">
                {t('learn.challenge.description')}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('learn.challenge.progress')}</span>
              <Badge variant="secondary">{t('learn.challenge.daysLeft')}</Badge>
            </div>
            <Progress value={43} className="h-2 bg-primary-foreground/20" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t('learn.tip.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium mb-2">{t('learn.tip.label')}</p>
            <p className="text-sm text-muted-foreground">
              {t('learn.tip.content')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}