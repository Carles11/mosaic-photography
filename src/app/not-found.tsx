import Link from "next/link";
import Image from "next/image";
import styles from "./Error.module.css";

export const metadata = {
  title: "Oops! Page not found",
};

export default function Error() {
  return (
    <>
      <main className={styles.errorContainer}>
        <Image
          className={styles.image}
          src={"/error.svg"}
          width={640}
          height={220}
          alt="error image"
        />
        <h1>404</h1>
        <p>Opps! This page is lost in space.</p>

        <Link href="/" className={styles.btn}>
          Return home
        </Link>
      </main>
    </>
  );
}
