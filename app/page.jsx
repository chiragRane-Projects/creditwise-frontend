"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPrediction(null);
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please upload a CSV file");

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    try {
      const response = await fetch("http://0.0.0.0:8000/api/v1/user/upload-statement", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to get prediction");
      const data = await response.json();
      setPrediction(data);
      toast.success("Prediction received successfully");
    } catch (error) {
      toast.error("Error predicting: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">CreditWise</h1>
      <p className="text-gray-600 mb-8">Upload your bank statement to check your creditworthiness</p>

      <Card className="w-full max-w-xl p-6 bg-white shadow-xl">
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="file-upload">Bank Statement (.csv)</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mt-2"
            />
          </div>
          <Button onClick={handleUpload} disabled={loading || !file}>
            {loading ? "Predicting..." : "Predict Creditworthiness"}
          </Button>
        </CardContent>
      </Card>

      {prediction && (
        <Card className="w-full max-w-xl mt-8 p-6 bg-white shadow-xl">
          <CardContent>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Prediction Result</h2>
            </div>

            <Separator className="my-4" />

            <Progress value={Math.round(prediction.confidence * 100)} className="mb-4" />
            <p className="text-sm text-gray-500 mb-2">
  Confidence: {typeof prediction.prediction?.confidence === "number" && !isNaN(prediction.prediction.confidence)
    ? `${(prediction.prediction.confidence * 100).toFixed(2)}%`
    : "N/A"}
</p>



            <Table>
              <TableBody>
                {Object.entries(prediction.features).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{key.replace(/_/g, " ")}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {prediction.tip && (
              <Alert className="mt-6">
                <AlertTitle>💡 Tip</AlertTitle>
                <AlertDescription>{prediction.tip}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
