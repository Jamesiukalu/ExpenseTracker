import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import {
  Upload,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "./ui/use-toast";

interface ImportDataProps {
  onBack?: () => void;
}

const ImportData = ({ onBack = () => {} }: ImportDataProps) => {
  const [importType, setImportType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Validate file type
      const allowedTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV or Excel file.",
          variant: "destructive",
        });
        setFile(null);
        return;
      }

      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        setFile(null);
        return;
      }
    }
  };

  const simulateUpload = async () => {
    setIsUploading(true);
    setUploadStatus("uploading");
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setUploadProgress(i);
    }

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsUploading(false);
    setUploadStatus("success");
    toast({
      title: "Import Successful",
      description: "Your data has been imported successfully!",
    });
  };

  const handleImport = async () => {
    if (!importType) {
      toast({
        title: "Import Type Required",
        description: "Please select an import type.",
        variant: "destructive",
      });
      return;
    }

    if (importType === "file" && !file) {
      toast({
        title: "File Required",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }

    if (importType === "csv" && !csvData.trim()) {
      toast({
        title: "CSV Data Required",
        description: "Please enter CSV data to import.",
        variant: "destructive",
      });
      return;
    }

    await simulateUpload();
  };

  const downloadTemplate = () => {
    const csvContent = `Date,Description,Amount,Category\n2023-12-01,Grocery Shopping,85.47,Groceries\n2023-12-02,Gas Station,45.00,Gas/Fuel\n2023-12-03,Restaurant Dinner,78.50,Restaurants & Dining Out`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expense_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded to your device.",
    });
  };

  return (
    <div className="bg-background p-3 md:p-6 rounded-lg w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl md:text-2xl font-bold">Import Data</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Import Options</CardTitle>
            <CardDescription>
              Choose how you'd like to import your expense data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Import Type</Label>
              <Select value={importType} onValueChange={setImportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select import type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file">Upload File (CSV/Excel)</SelectItem>
                  <SelectItem value="csv">Paste CSV Data</SelectItem>
                  <SelectItem value="bank">
                    Bank Statement (Coming Soon)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {importType === "file" && (
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                    <span>({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>
            )}

            {importType === "csv" && (
              <div className="space-y-2">
                <Label htmlFor="csv-data">CSV Data</Label>
                <Textarea
                  id="csv-data"
                  placeholder="Paste your CSV data here...\nDate,Description,Amount,Category\n2023-12-01,Grocery Shopping,85.47,Groceries"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            )}

            {importType === "bank" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Bank statement import is coming soon. For now, please export
                  your bank data as CSV and use the file upload option.
                </AlertDescription>
              </Alert>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {uploadStatus === "success" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Data imported successfully! Your expenses have been added to
                  your account.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleImport}
                disabled={isUploading || importType === "bank"}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Importing..." : "Import Data"}
              </Button>
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Import Instructions</CardTitle>
            <CardDescription>
              Follow these guidelines for successful data import
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-1">File Format</h4>
                <p className="text-sm text-muted-foreground">
                  Supported formats: CSV (.csv), Excel (.xlsx, .xls)
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1">Required Columns</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Date (YYYY-MM-DD format)</li>
                  <li>• Description (expense description)</li>
                  <li>• Amount (positive number)</li>
                  <li>• Category (expense category)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1">File Size Limit</h4>
                <p className="text-sm text-muted-foreground">
                  Maximum file size: 5MB
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1">Data Validation</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Dates must be valid</li>
                  <li>• Amounts must be positive numbers</li>
                  <li>• Categories will be auto-matched</li>
                  <li>• Duplicate entries will be detected</li>
                </ul>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Tip:</strong> Download the template to see the exact
                format required for your data.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportData;
