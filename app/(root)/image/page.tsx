"use client";
import { useState } from "react";
import axios from "axios";
import * as z from "zod";
import { Heading } from "@/components/heading";
import { ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import Image from "next/image";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { BotAvatar } from "@/components/bot-avatar";
import { UserAvatar } from "@/components/user-avatar";
import Layout from "@/components/Layout";

// My Custom Code from ChatGPT
interface ChatCompletionContentPartText {
  type: "text";
  text: string;
}

interface ChatCompletionContentPartImage {
  type: "image";
  url: string;
  alt: string;
}

type ChatCompletionContentPart =
  | ChatCompletionContentPartText
  | ChatCompletionContentPartImage;

const isTextPart = (
  part: ChatCompletionContentPart
): part is ChatCompletionContentPartText => part.type === "text";
// My Custom Code from ChatGPT end here

const ImagePage = () => {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: "", amount: "1", resolution: "512x512" },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setImages([]);
      const response = await axios.post("/api/image", values);

      const urls = response.data.map((image: { url: string }) => image.url);
      setImages(urls);
      form.reset();
    } catch (error: any) {
      // TODO: Open Pro Modal
      console.log(error);
    } finally {
      router.refresh();
    }
  };

  // My Custom Code from ChatGPT
  const renderContent = (
    content: string | ChatCompletionContentPart[] | null | undefined
  ) => {
    if (typeof content === "string") {
      return content;
    } else if (Array.isArray(content)) {
      return content.map((part, index) => {
        if (typeof part === "string") {
          return <span key={index}>{part}</span>;
        } else if (isTextPart(part)) {
          return <span key={index}>{part.text}</span>;
        } else {
          return <Image key={index} src={part.url} alt={part.alt} />;
        }
      });
    } else {
      return null;
    }
  };
  // My Custom Code from ChatGPT end here

  return (
    <Layout>
      <div>
        <Heading
          title="Image Generation"
          description="Turn your prompt into an image."
          icon={ImageIcon}
          iconColor="text-pink-700"
          bgColor="bg-pink-700/10"
        />
        <div className="px-4 lg:px-8">
          <div className="px-4 lg:px-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="rounded-lg border w-full p-4 px-3 md:px-6 focus-whithin:shadow-sm grid grid-cols-12 gap-2"
              >
                <FormField
                  name="prompt"
                  render={({ field }) => (
                    <FormItem className="col-span-12 lg:col-span-10">
                      <FormControl className="m-0 p-0">
                        <Input
                          className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                          disabled={isLoading}
                          placeholder="How do I calculate the radius of a circle?"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  className="col-span-12 lg:col-span-2 w-full"
                  disabled={isLoading}
                >
                  Generate
                </Button>
              </form>
            </Form>
          </div>
          <div className="space-y-4 mt-4">
            {isLoading && (
              <div className="p-20">
                <Loader />
              </div>
            )}
            {images.length === 0 && !isLoading && (
              <div>
                <Empty label="No images generated." />
              </div>
            )}
            <div>Images will be rendered here</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ImagePage;
