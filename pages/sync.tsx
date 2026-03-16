import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import AdminPage from "components/AdminPage";
import type { ImgFormat } from "lib/species";
import { GetServerSideProps } from "next";

type SyncOperation = {
  id: string;
  name: string;
  description: string;
  endpoint: string;
};

type FileSizeFormatTotal = {
  format: ImgFormat;
  bytes: number;
  formatted: string;
};

type FileSizeResult = {
  totalBytes: number;
  totalFormatted: string;
  formatTotals: FileSizeFormatTotal[];
  buckets: {
    size: number;
    totalBytes: number;
    totalFormatted: string;
    formatTotals: FileSizeFormatTotal[];
  }[];
};

type SyncOperationResult = {
  message?: string;
  [key: string]: any;
};

type SyncCount = {
  operation: string;
  count: number;
};

const SYNC_OPERATIONS: SyncOperation[] = [
  {
    id: "download-originals",
    name: "Download Originals",
    description: "Download original images from source URLs",
    endpoint: "/api/download-originals",
  },
  {
    id: "generate-thumbs",
    name: "Generate Thumbnails",
    description: "Generate resized thumbnail images",
    endpoint: "/api/generate-thumbs",
  },
  {
    id: "upload-to-s3",
    name: "Upload to S3",
    description: "Upload processed images to S3 storage",
    endpoint: "/api/upload-to-s3",
  },
  {
    id: "generate-data",
    name: "Generate Data",
    description: "Generate JSON data files for the application",
    endpoint: "/api/generate-data",
  },
];

const ADDITIONAL_OPERATIONS: SyncOperation[] = [
  {
    id: "upload-missing-to-s3",
    name: "Upload Missing",
    description: "Scan S3 for missing uploaded images, compare against expected thumbnails, and restore any gaps",
    endpoint: "/api/upload-missing-to-s3",
  },
  {
    id: "regenerate-missing-thumbnails",
    name: "Regenerate Missing Thumbnails",
    description: "Backfill any missing resized thumbnail files without resetting processed images",
    endpoint: "/api/regenerate-missing-thumbnails",
  },
  {
    id: "calculate-file-sizes",
    name: "Calculate File Sizes",
    description: "Summarize total disk usage for resized thumbnails by size bucket and image format",
    endpoint: "/api/calculate-file-sizes",
  },
];

export default function SyncPage() {
  const [runningOperations, setRunningOperations] = useState<Set<string>>(new Set());
  const [fileSizeResult, setFileSizeResult] = useState<FileSizeResult | null>(null);
  const queryClient = useQueryClient();

  const { data: counts, isLoading } = useQuery<SyncCount[]>({
    queryKey: ["sync-counts"],
    queryFn: async () => {
      const response = await fetch("/api/sync-counts");
      if (!response.ok) throw new Error("Failed to fetch sync counts");
      return response.json();
    },
  });

  const runSyncMutation = useMutation({
    mutationFn: async (operation: SyncOperation) => {
      const response = await fetch(operation.endpoint, { method: "POST" });
      if (!response.ok) throw new Error(`Failed to run ${operation.name}`);
      return response.json();
    },
    onSuccess: (data: SyncOperationResult, operation) => {
      if (operation.id === "calculate-file-sizes") {
        setFileSizeResult(data as FileSizeResult);
      }
      toast.success(data.message || `${operation.name} completed successfully!`);
      setRunningOperations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(operation.id);
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ["sync-counts"] });
    },
    onError: (error, operation) => {
      toast.error(`Failed to run ${operation.name}: ${error.message}`);
      setRunningOperations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(operation.id);
        return newSet;
      });
    },
  });

  const handleRunSync = (operation: SyncOperation) => {
    setRunningOperations((prev) => new Set(prev).add(operation.id));
    runSyncMutation.mutate(operation);
  };

  const getCountForOperation = (operationId: string): number => {
    if (!counts) return 0;
    const count = counts.find((c) => c.operation === operationId);
    return count?.count || 0;
  };

  const renderOperationsTable = ({
    operations,
    showPending,
  }: {
    operations: SyncOperation[];
    showPending: boolean;
  }) => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              {showPending && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items Pending
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {operations.map((operation) => {
              const count = showPending ? getCountForOperation(operation.id) : 0;
              const isRunning = runningOperations.has(operation.id);
              const isDisabled = isRunning || runSyncMutation.isPending;

              return (
                <tr key={operation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{operation.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{operation.description}</div>
                  </td>
                  {showPending && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {isLoading ? (
                          <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
                        ) : (
                          <span className={`font-medium ${count > 0 ? "text-blue-700" : "text-gray-500"}`}>
                            {count.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleRunSync(operation)}
                      disabled={isDisabled}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isRunning ? "Running..." : "Run Operation"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <AdminPage title="Sync">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sync Operations</h1>
          <p className="text-gray-600">Manage data synchronization processes</p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Primary Operations</h2>
            <p className="text-sm text-gray-600 mb-4">
              Standard sync jobs for downloading, generating, uploading, and publishing data.
            </p>
            {renderOperationsTable({ operations: SYNC_OPERATIONS, showPending: true })}
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Additional Operations</h2>
            <p className="text-sm text-gray-600 mb-4">
              Maintenance utilities for backfills and one-off thumbnail repairs.
            </p>
            {renderOperationsTable({ operations: ADDITIONAL_OPERATIONS, showPending: false })}

            {fileSizeResult && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">File Size Summary</h3>
                <p className="text-sm text-slate-700 mb-3">
                  Total for all thumbnails: <span className="font-semibold">{fileSizeResult.totalFormatted}</span>
                </p>
                <div className="space-y-2 mb-4">
                  {fileSizeResult.formatTotals.map((total) => (
                    <div key={total.format} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm">
                      <span className="font-medium uppercase text-slate-900">{total.format}</span>:{" "}
                      <span className="text-slate-700">{total.formatted}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {fileSizeResult.buckets.map((bucket) => (
                    <div key={bucket.size} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm">
                      <div className="font-medium text-slate-900 mb-1">
                        {bucket.size}px total: <span className="font-semibold">{bucket.totalFormatted}</span>
                      </div>
                      <div className="space-y-1">
                        {bucket.formatTotals.map((total) => (
                          <div key={`${bucket.size}-${total.format}`} className="text-slate-700">
                            <span className="uppercase">{total.format}</span>: {total.formatted}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminPage>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  if (process.env.NODE_ENV !== "development") {
    return { notFound: true };
  }
  return {
    props: {},
  };
};
