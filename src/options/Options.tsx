import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"
import { Slider } from "../components/ui/slider"

export default function Options() {
  const [tabLimit, setTabLimit] = useState(20)
  const [expirationDays, setExpirationDays] = useState('7')
  const [notifWindow, setNotifWindow] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save these values to Chrome's storage
    console.log('Saving options:', { tabLimit, expirationDays, notifWindow })
  }

  return (
    <div id='my-ext' data-theme='light' className="container mx-auto p-4">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Tab Manager Options</CardTitle>
          <CardDescription>Configure your tab management preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="tabLimit">Tab Limit (5-100)</Label>
                <Slider
                  id="tabLimit"
                  min={5}
                  max={100}
                  step={1}
                  value={[tabLimit]}
                  onValueChange={(value) => setTabLimit(value[0])}
                />
                <div className="text-sm text-muted-foreground mt-1">
                  Current value: {tabLimit}
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="expirationDays">Expiration of Closed Tabs</Label>
                <Select value={expirationDays} onValueChange={setExpirationDays}>
                  <SelectTrigger id="expirationDays">
                    <SelectValue placeholder="Select expiration days" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="notifWindow">Notification Window (1-24 hours before delete)</Label>
                <Input 
                  id="notifWindow" 
                  type="number" 
                  min={1}
                  max={24}
                  value={notifWindow}
                  onChange={(e) => setNotifWindow(Math.min(24, Math.max(1, parseInt(e.target.value))))}
                  placeholder="Enter notification window" 
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  )
}