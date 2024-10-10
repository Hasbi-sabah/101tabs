import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Trash2,
} from 'lucide-react';
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
} from '../components/ui/alert-dialog';
import { Button } from '../components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { toast } from '../hooks/use-toast';
import { defaultMode } from '../background/index';

export default function Options() {
  const [julienMode, setJulienMode] = useState(false);
  const [tabLimit, setTabLimit] = useState(7);
  const [expirationDays, setExpirationDays] = useState(3);
  const [save, setSave] = useState<string>('Save Changes');

  useEffect(() => {
    chrome.storage.local.get(['tabLimit', 'expirationDays'], (result) => {
      setTabLimit(result.tabLimit || 7);
      setExpirationDays(result.expirationDays / (24 * 60 * 60 * 1000) || 3);
      setJulienMode(result.tabLimit === 3);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    chrome.storage.local.set({
      tabLimit,
      expirationDays: expirationDays * 24 * 60 * 60 * 1000,
    });
    setSave('Saved');
    toast({
      title: 'Settings saved',
      description: 'Your changes have been successfully saved.',
    });
    setTimeout(() => {
      setSave('Save Changes');
    }, 2000);
  };

  const handleExport = () => {
    chrome.storage.local.get(
      {
        tabLimit: defaultMode.tabLimit,
        expirationDays: defaultMode.expirationDays,
        reminderAlarm: defaultMode.reminderAlarm,
        tempList: [],
        expiringTabs: [],
      },
      (result) => {
        const blob = new Blob([JSON.stringify(result)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '101tabs-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    );
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setTabLimit(data.tabLimit);
          setExpirationDays(data.expirationDays / (24 * 60 * 60 * 1000));
          // setJulienMode(data.julienMode);
          chrome.storage.local.set({
            tabLimit: data.tabLimit,
            expirationDays: data.expirationDays,
            reminderAlarm: data.reminderAlarm,
            tempList: data.tempList,
            expiringTabs: data.expiringTabs,
          });
          toast({
            title: 'Settings imported',
            description: 'Your settings have been successfully imported.',
          });
        } catch (error) {
          toast({
            title: 'Import failed',
            description: 'There was an error importing your settings.',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    }
  };
  const handleDeleteData = () => {
    chrome.storage.local.clear(() => {
      setTabLimit(7);
      setExpirationDays(3);
      setJulienMode(false);
      toast({
        title: "Data deleted",
        description: "All your data has been successfully deleted.",
      });
    });
  };
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Tab Manager Options</h1>
      <p className="text-lg text-muted-foreground mb-8">Configure your tab management preferences</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {julienMode ? (
          <div className="rounded-lg bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-1">
            <div className="rounded-lg bg-white p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-purple-500" />
                <h3 className="text-2xl font-semibold text-purple-700">Julien Mode Activated</h3>
              </div>
              <p className="mt-4 text-lg text-gray-600">For those lacking basic time travel abilities:</p>
              <ul className="mt-4 space-y-2 text-lg text-gray-600">
                <li className="flex items-center">
                  <AlertTriangle className="mr-3 h-6 w-6 text-yellow-500" />
                  Tab Limit: 3
                </li>
                <li className="flex items-center">
                  <AlertTriangle className="mr-3 h-6 w-6 text-yellow-500" />
                  Expiration of Closed Tabs: 2 mins
                </li>
                <li className="flex items-center">
                  <AlertTriangle className="mr-3 h-6 w-6 text-yellow-500" />
                  Alarm before deletion: 1 min
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label htmlFor="tabLimit" className="text-xl font-medium">Tab Limit (5-30)</Label>
              <Slider
                id="tabLimit"
                min={5}
                max={30}
                step={1}
                value={[tabLimit]}
                onValueChange={(value) => setTabLimit(value[0])}
                className="w-full"
              />
              <div className="text-lg text-muted-foreground">Current value: {tabLimit} tabs</div>
            </div>
            <div className="space-y-4">
              <Label htmlFor="expirationDays" className="text-xl font-medium">Expiration of Closed Tabs (1-7 days)</Label>
              <Slider
                id="expirationDays"
                min={1}
                max={7}
                step={1}
                value={[expirationDays]}
                onValueChange={(value) => setExpirationDays(value[0])}
                className="w-full"
              />
              <div className="text-lg text-muted-foreground">
                Current value: {expirationDays} day{expirationDays > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="space-x-4">
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Settings
            </Button>
            <Button variant="outline" className="relative">
              <input
                type="file"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".json"
              />
              <Upload className="mr-2 h-4 w-4" />
              Import Settings
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your saved data and reset your settings to default.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteData}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {!julienMode && (
            <Button
              onClick={handleSubmit}
              variant={save === 'Saved' ? 'default' : 'default'}
              className={save === 'Saved' ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              {save === 'Saved' ? <CheckCircle className="mr-2 h-4 w-4" /> : null}
              {save}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
