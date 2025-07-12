import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import AdminPage from "components/AdminPage";
import { GetServerSideProps } from "next";
import { clsx } from "clsx";

type SyncOperation = {
  id: string;
  name: string;
  description: string;
  endpoint: string;
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

export default function SyncPage() {
  const [runningOperations, setRunningOperations] = useState<Set<string>>(new Set());
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
    onSuccess: (data, operation) => {
      toast.success(`${operation.name} completed successfully!`);
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

  return (
    <AdminPage title="Sync">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sync Operations</h1>
          <p className="text-gray-600">Manage data synchronization processes</p>
        </div>

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items Pending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {SYNC_OPERATIONS.map((operation) => {
                  const count = getCountForOperation(operation.id);
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
