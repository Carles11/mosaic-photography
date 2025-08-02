import Image from "next/image";
import { User } from "@/types/user";

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start gap-8">
      <div className="relative w-32 h-32 md:w-40 md:h-40">
        <Image
          src={user.avatar || "/images/default-avatar.jpg"}
          alt={`${user.displayName || user.username}'s profile picture`}
          fill
          className="rounded-full object-cover"
        />
      </div>

      <div className="flex-1">
        <h1 className="text-3xl font-bold">
          {user.displayName || user.username}
        </h1>
        {user.location && <p className="text-gray-600 mt-1">{user.location}</p>}

        <div className="flex gap-6 mt-4 text-sm">
          <div>
            <span className="font-bold">{user.portfolioCount || 0}</span> photos
          </div>
          <div>
            <span className="font-bold">{user.followersCount || 0}</span>{" "}
            followers
          </div>
          <div>
            <span className="font-bold">{user.followingCount || 0}</span>{" "}
            following
          </div>
        </div>

        {user.bio && (
          <div className="mt-4 text-gray-800">
            <p>{user.bio}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Follow
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Message
          </button>
        </div>
      </div>
    </div>
  );
}
