// import { supabase } from "./supabaseClient";

// // Function to get all URLs of images
// export async function getAllImageUrls(): Promise<string[]> {
//   const { data, error } = await supabase.from("images").select("url");

//   if (error) {
//     console.error("Error fetching image URLs:", error);
//     return [];
//   }

//   return data.map((image: { url: string }) => image.url);
// }

// // Function to get the last modified date of a URL
// export async function getLastModifiedDate(url: string): Promise<string> {
//   // console.log("Fetching last modified date for URL:", url); // Log the URL

//   const { data, error } = await supabase
//     .from("images")
//     .select("last_modified")
//     .eq("url", url)
//     .limit(1);

//   if (error) {
//     console.error("Error fetching last modified date:", error);
//     return new Date().toISOString();
//   }

//   // console.log("Data returned:", data); // Log the returned data
//   return new Date(data[0]?.last_modified).toISOString();
// }
