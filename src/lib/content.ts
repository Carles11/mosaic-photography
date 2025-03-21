import { supabase } from "./supabaseClient";

// Function to get all URLs of images
export async function getAllImageUrls(): Promise<string[]> {
  const { data, error } = await supabase.from("images").select("url");

  if (error) {
    console.error("Error fetching image URLs:", error);
    return [];
  }

  return data.map((image: { url: string }) => image.url);
}

// Function to get the last modified date of a URL
export async function getLastModifiedDate(url: string): Promise<string> {
  const { data, error } = await supabase
    .from("images")
    .select("last_modified")
    .eq("url", url)
    .single();

  if (error) {
    console.error("Error fetching last modified date:", error);
    return new Date().toISOString();
  }

  return new Date(data.last_modified).toISOString();
}
