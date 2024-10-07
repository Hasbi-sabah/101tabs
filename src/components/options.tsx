import React, { JSX, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"
import { Slider } from "../components/ui/slider"

export default function Options({ handleCancel }: { handleCancel: () => void }) {
    const [tabLimit, setTabLimit] = useState(7)
    const [expirationDays, setExpirationDays] = useState(3)

    useEffect(() => {
        chrome.storage.local.get(['tabLimit', 'expirationDays'], (result) => {
            setTabLimit(result.tabLimit || 7)
            setExpirationDays(result.expirationDays / (24 * 60 * 60 * 1000) || 3)
        })
    }, [])
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        chrome.storage.local.set({ tabLimit, expirationDays: expirationDays * 24 * 60 * 60 * 1000 })
        console.log('Saving options:', { tabLimit, expirationDays })
    }
    return (
        <Card className="w-[350px] border-none shadow-none">
            <CardHeader>
                <CardTitle>Tab Manager Options</CardTitle>
                <CardDescription>Configure your tab management preferences</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid w-full items-center gap-6">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="tabLimit">Tab Limit (5-30)</Label>
                            <Slider
                                id="tabLimit"
                                min={5}
                                max={30}
                                step={1}
                                value={[tabLimit]}
                                onValueChange={(value) => setTabLimit(value[0])}
                            />
                            <div className="text-sm text-muted-foreground mt-1">
                                Current value: {tabLimit} tabs
                            </div>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="expirationDays">Expiration of Closed Tabs (1-7 days)</Label>
                            <Slider
                                id="expirationDays"
                                min={1}
                                max={7}
                                step={1}
                                value={[expirationDays]}
                                onValueChange={(value) => setExpirationDays(value[0])}
                            />
                            <div className="text-sm text-muted-foreground mt-1">
                                Current value: {expirationDays} day{expirationDays > 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button onClick={handleCancel} variant="outline">Cancel</Button>
                <Button onClick={handleSubmit}>Save Changes</Button>
            </CardFooter>
        </Card>
    )
}