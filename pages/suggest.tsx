import React from "react";
import { useForm } from "react-hook-form";
import useMutation from "hooks/useMutation";
import { toast } from "react-hot-toast";
import Head from "next/head";
import ClientPage from "components/ClientPage";
import Form from "components/Form";
import Input from "components/Input";
import Submit from "components/Submit";
import Link from "next/link";
import { LicenseLabel, ImgSourceLabel } from "lib/types";

type SuggestFormData = {
  imageUrl: string;
  comments: string;
  name: string;
  email: string;
};

export default function SuggestImage() {
  const form = useForm<SuggestFormData>();
  const { reset } = form;

  const { mutate: submitSuggestion, isPending } = useMutation({
    url: "/api/suggest-image",
    method: "POST",
    showToast: false,
    onSuccess: () => {
      toast.success("Thank you for your suggestion! We'll review it soon.");
      reset();
    },
    onError: (error: any) => {
      toast.error("Failed to submit suggestion. Please try again.");
    },
  });

  const onSubmit = (data: SuggestFormData) => {
    submitSuggestion(data);
  };

  return (
    <ClientPage>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Suggest Image - Avicommons</title>
          <meta name="description" content="Suggest a new bird image for Avicommons" />
        </Head>

        <div className="container mx-auto px-6 pb-10 pt-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                ← Back to home
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Suggest an Image</h1>
              <p className="text-gray-600 mb-8">
                Help us expand and improve our collection by suggesting a new or better image for any species.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Guidelines for Image Suggestions</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Supported Sources</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {Object.entries(ImgSourceLabel)
                        .filter(([key]) => key !== "ebird")
                        .map(([key, label]) => (
                          <li key={key} className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            {label}
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Accepted Licenses</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {Object.entries(LicenseLabel).map(([key, label]) => (
                        <li key={key} className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          {label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <Form form={form} onSubmit={onSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      URL to iNaturalist observation, Wikipedia image, or Flickr photo{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <Input
                      type="url"
                      name="imageUrl"
                      required
                      placeholder="E.g. https://www.inaturalist.org/observations/1234567890"
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name <span className="text-red-600">*</span>
                      </label>
                      <Input type="text" name="name" required placeholder="E.g. John Doe" className="w-full" />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Email <span className="text-red-600">*</span>
                      </label>
                      <Input
                        type="email"
                        name="email"
                        required
                        placeholder="E.g. john@example.com"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                      Comments
                    </label>
                    <textarea
                      {...form.register("comments")}
                      rows={4}
                      placeholder="Any additional information or comments to the editor..."
                      className="form-input w-full"
                    />
                  </div>

                  <Submit disabled={isPending} className="flex-1">
                    {isPending ? "Submitting..." : "Submit Suggestion"}
                  </Submit>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </ClientPage>
  );
}
