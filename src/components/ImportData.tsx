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
import Papa from 'papaparse';
import api from "../api";

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
        toast({ title: "Invalid File Type", description: "Upload CSV/Excel.", variant: "destructive" });
        e.target.value = "";
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        toast({ title: "File Too Large", description: "Max 5MB.", variant: "destructive" });
        e.target.value = "";
        return;
      }
      setFile(selected);
    }
  };

  const parseAndUpload = async (text: string) => {
    const parsed = Papa.parse(text.trim(), { header: true });
    const rows = parsed.data as any[];
    setIsUploading(true);
    setUploadStatus("uploading");
    for (let i = 0; i < rows.length; i++) {
      const { Date, Description, Amount, Category } = rows[i];
      try {
        await api.post("/expenses", {
          date: Date,
          description: Description,
          amount: parseFloat(Amount),
          category: Category,
        });
      } catch (err: any) {
        console.error("Row upload error", err);
      }
      setUploadProgress(Math.round(((i + 1) / rows.length) * 100));
    }
    setIsUploading(false);
    setUploadStatus("success");
    toast({ title: "Import Successful", description: `${rows.length} records imported.` });
  };

  const handleImport = async () => {
    if (!importType) {
      toast({ title: "Select Type", description: "Choose import type.", variant: "destructive" });
      return;
    }
    try {
      if (importType === "file" && file) {
        const text = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload = (e) => res(e.target?.result as string);
          reader.onerror = () => rej();
          reader.readAsText(file);
        });
        await parseAndUpload(text);
      } else if (importType === "csv" && csvData.trim()) {
        await parseAndUpload(csvData);
      }
    } catch (err: any) {
      console.error(err);
      setIsUploading(false);
      setUploadStatus("error");
      toast({ title: "Import Failed", description: err.message, variant: "destructive" });
    }
  };

  const downloadTemplate = () => {
    const csv = `Date,Description,Amount,Category\n2023-12-01,Grocery Shopping,85.47,Groceries\n2023-12-02,Gas Station,45.00,Gas/Fuel`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expense_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Template Downloaded", description: "CSV template ready." });
  };

  return (
    <div className="bg-background p-6 rounded-lg max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Import Data</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Import Options</CardTitle>
            <CardDescription>Choose import method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label>Import Type</Label>
            <Select value={importType} onValueChange={setImportType}>
              <SelectTrigger><SelectValue placeholder="Select import type"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="file">Upload File (CSV)</SelectItem>
                <SelectItem value="csv">Paste CSV Data</SelectItem>
                <SelectItem value="bank">Bank Statement (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>

            {importType === "file" && (
              <div className="space-y-2">
                <Label>Select File</Label>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  ref={fileRef}
                />
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                    <span>({(file.size/1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>
            )}

            {importType === "csv" && (
              <div>
                <Label>CSV Data</Label>
                <Textarea
                  rows={8}
                  value={csvData}
                  onChange={e => setCsvData(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            )}

            {importType === "bank" && (
              <Alert>
                <AlertCircle />
                <AlertDescription>
                  Coming soon; please use CSV.
                </AlertDescription>
              </Alert>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span><span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2"/>
              </div>
            )}

            {uploadStatus === "success" && (
              <Alert>
                <CheckCircle />
                <AlertDescription>Import complete!</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={isUploading || importType==="bank"}>
                <Upload className="mr-2" /> {isUploading?"Importing...":"Import Data"}
              </Button>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="mr-2"/>Download Template
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>Data format guidelines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1">
              <li>Date in YYYY-MM-DD</li>
              <li>Description text</li>
              <li>Amount positive number</li>
              <li>Category matching existing</li>
            </ul>
            <Alert>
              <AlertCircle />
              <AlertDescription>
                Use template to ensure correct CSV format.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportData;