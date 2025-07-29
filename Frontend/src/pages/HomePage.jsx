import { useEffect, useState, useCallback } from "react";
import {
  getFriends,
  getRecommendedUsers,
} from "../api/users";
import {
  acceptFriendRequest,
  deleteFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  sendFriendRequest,
} from "../api/friends";
import Section from "../components/Shared/Section";
import UserCard from "../components/User/UserCard";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [friends, setFriends] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [f, r, i, o] = await Promise.all([
        getFriends(),
        getRecommendedUsers(),
        getIncomingRequests(),
        getOutgoingRequests(),
      ]);
      setFriends(f);
      setRecommended(r);
      setIncoming(i);
      setOutgoing(o);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <div className="text-blue-600 font-medium animate-pulse text-lg">
            Loading your social space...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <Section title="Your Friends">
            {friends.length ? (
              friends.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  onClick={() => navigate(`/chat/${user._id}`)}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">
                You don’t have any friends yet.
              </p>
            )}
          </Section>

          <Section title="Recommended Users">
            {recommended.length ? (
              recommended.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  actionLabel="Add Friend"
                  onAction={async () => {
                    await sendFriendRequest(user._id);
                    fetchData();
                  }}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No recommendations right now.
              </p>
            )}
          </Section>

          <Section title="Incoming Friend Requests">
            {incoming.length ? (
              incoming.map((request) => (
                <UserCard
                  key={request._id}
                  user={request.sender}
                  actionLabel="Accept"
                  onAction={async () => {
                    await acceptFriendRequest(request._id);
                    fetchData();
                  }}
                  secondaryActionLabel="Reject"
                  onSecondaryAction={async () => {
                    await deleteFriendRequest(request._id);
                    fetchData();
                  }}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No incoming friend requests.
              </p>
            )}
          </Section>

          <Section title="Sent Requests">
            {outgoing.length ? (
              outgoing.map((request) => (
                <UserCard
                  key={request._id}
                  user={request.receiver}
                  actionLabel="Cancel"
                  onAction={async () => {
                    await deleteFriendRequest(request._id);
                    fetchData();
                  }}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">
                You haven’t sent any friend requests.
              </p>
            )}
          </Section>
        </div>
      </div>
    </>
  );
};

export default HomePage;
