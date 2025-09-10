import React from "react";
import { useForm } from "react-hook-form";
import useMutation from "hooks/useMutation";
import { toast } from "react-hot-toast";
import Head from "next/head";
import ClientPage from "components/ClientPage";
import Link from "next/link";
import Form from "components/Form";
import Input from "components/Input";
import Submit from "components/Submit";

type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

export default function Contact() {
  const form = useForm<ContactFormData>();
  const { reset } = form;

  const { mutate: submitContact, isPending } = useMutation({
    url: "/api/contact",
    method: "POST",
    showToast: false,
    onSuccess: () => {
      toast.success("Thank you for your message! We'll get back to you soon.");
      reset();
    },
    onError: (error: any) => {
      toast.error("Failed to send message. Please try again.");
    },
  });

  const onSubmit = (data: ContactFormData) => {
    submitContact(data);
  };

  return (
    <ClientPage>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Contact - Avicommons</title>
        </Head>

        <div className="container mx-auto px-6 pb-10 pt-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                ← Back to home
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Contact</h1>
              <p className="text-gray-600 mb-8">
                Get in touch with questions, feedback, or suggestions about Avicommons.
              </p>

              <Form form={form} onSubmit={onSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name <span className="text-red-600">*</span>
                      </label>
                      <Input type="text" name="name" required className="w-full" />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Email <span className="text-red-600">*</span>
                      </label>
                      <Input type="email" name="email" required className="w-full" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      {...form.register("message", { required: "Message is required" })}
                      rows={6}
                      placeholder="Please describe your question or feedback..."
                      className="form-input w-full"
                    />
                  </div>

                  <Submit disabled={isPending}>{isPending ? "Sending..." : "Send Message"}</Submit>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </ClientPage>
  );
}
