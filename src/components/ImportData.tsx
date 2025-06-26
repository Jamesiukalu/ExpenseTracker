import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Progress } from "./ui/progress";
import {
  Upload,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  FileInput,
  ClipboardPaste,
  Banknote,
  ChevronDown,
} from "lucide-react";
import { useToast } from "./ui/use-toast";
import Papa from 'papaparse';
import api from "../api";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

interface ImportDataProps {
  onBack?: () => void;
}

const ImportData = ({ onBack = () => {} }: ImportDataProps) => {
  const [importType, setImportType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const allowed = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      
      if (!allowed.includes(selected.type)) {
        toast({ 
          title: "Invalid File Type", 
          description: "Please upload a CSV or Excel file.", 
          variant: "destructive" 
        });
        e.target.value = "";
        return;
      }
      
      if (selected.size > 5 * 1024 * 1024) {
        toast({ 
          title: "File Too Large", 
          description: "Maximum file size is 5MB.", 
          variant: "destructive" 
        });
        e.target.value = "";
        return;
      }
      
      setFile(selected);
      setUploadStatus("idle");
    }
  };

  const parseAndUpload = async (text: string) => {
    try {
      const parsed = Papa.parse(text.trim(), { header: true });
      const rows = parsed.data as any[];
      setIsUploading(true);
      setUploadStatus("uploading");
      
      let successCount = 0;
      for (let i = 0; i < rows.length; i++) {
        const { Date, Description, Amount, Category } = rows[i];
        try {
          await api.post("/expenses", {
            date: Date,
            description: Description,
            amount: parseFloat(Amount),
            category: Category,
          });
          successCount++;
        } catch (err) {
          console.error("Row upload error", err);
        }
        setUploadProgress(Math.round(((i + 1) / rows.length) * 100));
      }
      
      setIsUploading(false);
      setUploadStatus("success");
      toast({ 
        title: "Import Successful", 
        description: `Successfully imported ${successCount} of ${rows.length} records.`,
        className: "bg-green-50 border-green-200 text-green-800"
      });
    } catch (err) {
      setIsUploading(false);
      setUploadStatus("error");
      throw err;
    }
  };

  const handleImport = async () => {
    if (!importType) {
      toast({ 
        title: "Select Import Type", 
        description: "Please choose an import method.", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
      if (importType === "file" && file) {
        const text = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload = (e) => res(e.target?.result as string);
          reader.onerror = () => rej(new Error("Failed to read file"));
          reader.readAsText(file);
        });
        await parseAndUpload(text);
      } else if (importType === "csv" && csvData.trim()) {
        await parseAndUpload(csvData);
      }
    } catch (err: any) {
      console.error(err);
      setUploadStatus("error");
      toast({ 
        title: "Import Failed", 
        description: err.message || "An error occurred during import", 
        variant: "destructive" 
      });
    }
  };

  const downloadTemplate = () => {
    const csv = `Date,Description,Amount,Category\n${new Date().toISOString().split('T')[0]},Grocery Shopping,85.47,Groceries\n${new Date().toISOString().split('T')[0]},Gas Station,45.00,Transportation`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expense_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ 
      title: "Template Downloaded", 
      description: "CSV template has been downloaded.",
      className: "bg-blue-50 border-blue-200 text-blue-800"
    });
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCsvData(text);
      toast({
        title: "Pasted from clipboard",
        description: "CSV data has been pasted from your clipboard.",
        className: "bg-blue-50 border-blue-200 text-blue-800"
      });
    } catch (err) {
      toast({
        title: "Clipboard access denied",
        description: "Please paste manually or check browser permissions.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Import Financial Data</h1>
          <p className="text-muted-foreground">
            Bring your existing financial records into FinanceTracker
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Card */}
        <Card>
          <CardHeader>
            <CardTitle>Import Options</CardTitle>
            <CardDescription>Choose your preferred import method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Import Method</Label>
              <Select 
                value={importType} 
                onValueChange={(value) => {
                  setImportType(value);
                  setUploadStatus("idle");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select import method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file">
                    <div className="flex items-center">
                      <FileInput className="mr-2 h-4 w-4" />
                      Upload CSV File
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center">
                      <ClipboardPaste className="mr-2 h-4 w-4" />
                      Paste CSV Data
                    </div>
                  </SelectItem>
                  <SelectItem value="bank" disabled>
                    <div className="flex items-center">
                      <Banknote className="mr-2 h-4 w-4" />
                      Bank Statement (Coming Soon)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {importType === "file" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select CSV File</Label>
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors",
                      file ? "border-primary" : "border-muted"
                    )}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="font-medium">
                      {file ? file.name : "Click to select file"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {file 
                        ? `${(file.size / 1024).toFixed(1)} KB` 
                        : "Supports .csv, .xlsx (max 5MB)"}
                    </p>
                    <Input
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={handleFileChange}
                      ref={fileRef}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {importType === "csv" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>CSV Data</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handlePasteFromClipboard}
                      className="text-muted-foreground"
                    >
                      <ClipboardPaste className="mr-2 h-3 w-3" />
                      Paste
                    </Button>
                  </div>
                  <Textarea
                    rows={8}
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    className="font-mono text-sm"
                    placeholder={`Date,Description,Amount,Category\n2023-12-01,Grocery Shopping,85.47,Groceries\n2023-12-02,Gas Station,45.00,Transportation`}
                  />
                </div>
              </div>
            )}

            {importType === "bank" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                  Bank statement import is under development. Please use CSV import for now.
                </AlertDescription>
              </Alert>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {uploadStatus === "success" && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Import Complete</AlertTitle>
                <AlertDescription>
                  Your data has been successfully imported.
                </AlertDescription>
              </Alert>
            )}

            {uploadStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Import Failed</AlertTitle>
                <AlertDescription>
                  There was an error processing your import. Please check your file format and try again.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleImport} 
                disabled={isUploading || importType === "bank" || 
                  (importType === "file" && !file) || 
                  (importType === "csv" && !csvData.trim())}
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

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Import Guidelines</CardTitle>
            <CardDescription>
              How to format your data for successful import
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Required CSV Format</h3>
              <div className="bg-muted rounded-md p-4 font-mono text-sm overflow-x-auto">
                <pre>Date,Description,Amount,Category</pre>
                <pre>2023-12-01,Grocery Shopping,85.47,Groceries</pre>
                <pre>2023-12-02,Gas Station,45.00,Transportation</pre>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Data Requirements</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500 mt-0.5" />
                  <span>
                    <span className="font-medium">Date:</span> Must be in YYYY-MM-DD format
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500 mt-0.5" />
                  <span>
                    <span className="font-medium">Description:</span> Text describing the expense
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500 mt-0.5" />
                  <span>
                    <span className="font-medium">Amount:</span> Positive number (decimals allowed)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500 mt-0.5" />
                  <span>
                    <span className="font-medium">Category:</span> Must match existing categories
                  </span>
                </li>
              </ul>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important Notes</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>• First row must be headers (Date,Description,Amount,Category)</p>
                <p>• Maximum file size is 5MB</p>
                <p>• Duplicate records will be skipped</p>
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="bg-muted/50 border-t">
            <Button variant="link" size="sm" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download CSV Template
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ImportData;