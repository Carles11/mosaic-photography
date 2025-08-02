import { User } from "@/types/user";
import { FaInstagram, FaTwitter, FaGlobe, FaEnvelope } from "react-icons/fa";

interface ContactSectionProps {
  user: User;
}

export default function ContactSection({ user }: ContactSectionProps) {
  if (!user.socialLinks && !user.website && !user.contactEmail) {
    return null;
  }

  return (
    <section className="border-t border-gray-200 pt-8 mt-12">
      <h2 className="text-2xl font-bold mb-6">Contact & Social</h2>

      <div className="space-y-4">
        {user.contactEmail && (
          <div className="flex items-center gap-2">
            <FaEnvelope className="text-gray-600" />
            <a
              href={`mailto:${user.contactEmail}`}
              className="text-blue-600 hover:underline"
            >
              {user.contactEmail}
            </a>
          </div>
        )}

        {user.website && (
          <div className="flex items-center gap-2">
            <FaGlobe className="text-gray-600" />
            <a
              href={
                user.website.startsWith("http")
                  ? user.website
                  : `https://${user.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {user.website}
            </a>
          </div>
        )}

        {user.socialLinks?.instagram && (
          <div className="flex items-center gap-2">
            <FaInstagram className="text-gray-600" />
            <a
              href={`https://instagram.com/${user.socialLinks.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              @{user.socialLinks.instagram}
            </a>
          </div>
        )}

        {user.socialLinks?.twitter && (
          <div className="flex items-center gap-2">
            <FaTwitter className="text-gray-600" />
            <a
              href={`https://twitter.com/${user.socialLinks.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              @{user.socialLinks.twitter}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
