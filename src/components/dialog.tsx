import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle } from "lucide-react";

export default function Dialog({ handleReview, expiringTabsLength }: {
    handleReview: () => void;
    expiringTabsLength: number;
}): JSX.Element {
    const handleCancel = () => {
        window.close();
    }
    return (
        <Card className="w-[350px] border-none shadow-none">
            <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <CardTitle className="text-lg font-semibold">Review Expiring Tabs</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    You have {expiringTabsLength} tab{expiringTabsLength !== 1 && 's'} expiring in the next 24 hours.
                </p>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 pt-3">
                <Button onClick={handleCancel} variant="outline">Dismiss</Button>
                <Button onClick={handleReview}>Review</Button>
            </CardFooter>
        </Card>);
}