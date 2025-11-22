import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Moon, Sun, Languages, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { resetAllData } = useStore();

  const handleReset = () => {
    resetAllData();
    toast.success(t("settings.resetSuccess"));
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-3xl font-bold">{t("settings.title")}</h1>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.appearance")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label>{t("settings.theme")}</Label>
                <p className="text-sm text-muted-foreground">
                  {theme === "dark" ? t("settings.dark") : t("settings.light")}
                </p>
              </div>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.language")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>{t("settings.language")}</Label>
                <p className="text-sm text-muted-foreground">
                  {language === "id" ? t("settings.indonesian") : t("settings.english")}
                </p>
              </div>
            </div>
            <Switch
              checked={language === "en"}
              onCheckedChange={(checked) => setLanguage(checked ? "en" : "id")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.data")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <div>
                <Label>{t("settings.resetData")}</Label>
                <p className="text-sm text-muted-foreground">{t("settings.resetWarning")}</p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  {t("settings.resetData")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("settings.confirmReset")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("settings.resetWarning")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("settings.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    {t("settings.reset")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
