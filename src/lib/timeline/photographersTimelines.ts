import { TimelineItemModelProps } from "@/types/components";

export const photographerTimelines: Record<string, TimelineItemModelProps[]> = {
  stieglitz: [
    {
      title: "1864",
      cardTitle: "Born in Hoboken, New Jersey",
      cardDetailedText:
        "Alfred Stieglitz was born during the American Civil War, later becoming a pioneer of modern photography and a champion of photography as fine art.",
      eventType: "personal",
    },
    {
      title: "1865",
      cardTitle: "American Civil War Ends",
      cardDetailedText:
        "The American Civil War concluded, marking the beginning of Reconstruction and rapid industrialization in the United States.",
      eventType: "historical",
    },
    {
      title: "1881",
      cardTitle: "Studied Photography in Germany",
      cardDetailedText:
        "Began studying photochemistry and photography at the Technische Hochschule in Berlin under Hermann Wilhelm Vogel, developing crucial technical skills.",
      eventType: "personal",
    },
    {
      title: "1890",
      cardTitle: "Returned to New York City",
      cardDetailedText:
        "Returned to America determined to prove photography was as capable of artistic expression as painting or sculpture, and began photographing urban street life.",
      eventType: "personal",
    },
    {
      title: "1893",
      cardTitle: "Winter—Fifth Avenue",
      cardDetailedText:
        "Created one of his most celebrated early works during a snowstorm, capturing the atmospheric beauty of urban New York with a handheld camera.",
      eventType: "personal",
    },
    {
      title: "1902",
      cardTitle: "Founded Photo-Secession Movement",
      cardDetailedText:
        "Established the Photo-Secession to promote pictorial photography as a fine art, gathering like-minded photographers committed to artistic expression over technical precision.",
      eventType: "personal",
    },
    {
      title: "1903",
      cardTitle: "Launched Camera Work Magazine",
      cardDetailedText:
        "Began publishing the influential quarterly journal Camera Work, which showcased cutting-edge photographic art and became one of the most important photography publications of its era.",
      eventType: "personal",
    },
    {
      title: "1905",
      cardTitle: "Opened 291 Gallery",
      cardDetailedText:
        "Established the Little Galleries of the Photo-Secession at 291 Fifth Avenue, which became America's first foothold for modern art and introduced European avant-garde art to the United States.",
      eventType: "personal",
    },
    {
      title: "1907",
      cardTitle: "The Steerage",
      cardDetailedText:
        "Created his most iconic photograph aboard a ship to Europe, depicting passengers on the lower deck. The image became a landmark of modernist photography.",
      eventType: "personal",
    },
    {
      title: "1914",
      cardTitle: "World War I Begins",
      cardDetailedText:
        "The First World War erupted in Europe, transforming global politics and society. The conflict would reshape the modern world and influence artistic movements.",
      eventType: "historical",
    },
    {
      title: "1917",
      cardTitle: "Met Georgia O'Keeffe",
      cardDetailedText:
        "First encountered the work of Georgia O'Keeffe and arranged her first solo exhibition at 291, beginning a profound personal and professional relationship.",
      eventType: "personal",
    },
    {
      title: "1918",
      cardTitle: "World War I Ends",
      cardDetailedText:
        "The Great War concluded with the armistice, leaving millions dead and fundamentally altering European society and the global order.",
      eventType: "historical",
    },
    {
      title: "1924",
      cardTitle: "Married Georgia O'Keeffe",
      cardDetailedText:
        "Wed the painter Georgia O'Keeffe after his divorce, forming one of the most celebrated partnerships in American art history.",
      eventType: "personal",
    },
    {
      title: "1929",
      cardTitle: "Great Depression Begins",
      cardDetailedText:
        "The stock market crash triggered the Great Depression, profoundly affecting American society, culture, and the art world.",
      eventType: "historical",
    },
    {
      title: "1939",
      cardTitle: "World War II Begins",
      cardDetailedText:
        "Nazi Germany's invasion of Poland sparked the Second World War, the deadliest conflict in human history that would reshape the global landscape.",
      eventType: "historical",
    },
    {
      title: "1945",
      cardTitle: "World War II Ends & Atomic Age Begins",
      cardDetailedText:
        "World War II concluded with Japan's surrender after atomic bombs were dropped on Hiroshima and Nagasaki, ushering in the nuclear age.",
      eventType: "historical",
    },
    {
      title: "1946",
      cardTitle: "Passed Away in New York",
      cardDetailedText:
        "Died on July 13th at age 82, leaving an extraordinary legacy as photographer, art dealer, and champion of modernism who fundamentally changed American photography and art.",
      eventType: "personal",
    },
  ],
};

// Helper function to get timeline by surname
export function getTimelineBySlug(
  slug: string
): TimelineItemModelProps[] | null {
  return photographerTimelines[slug] || null;
}
