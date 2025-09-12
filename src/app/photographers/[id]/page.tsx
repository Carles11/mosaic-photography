import { type NextPage } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

const PhotographerDetailPage: NextPage<Props> = ({ params }) => {
  // For now, just show the photographer's ID
  if (!params?.id) return notFound();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Photographer Detail Page</h1>
      <p>
        Photographer ID: <strong>{params.id}</strong>
      </p>
    </main>
  );
};

export default PhotographerDetailPage;
