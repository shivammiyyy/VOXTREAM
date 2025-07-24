import { useEffect, useState } from "react";
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    
  });
  
  const fetchData = async () => {
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
  };

  return (
    <>
      <Navbar />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Your Friends">
          {(friends || []).map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onClick={() => navigate(`/chat/${user._id}`)}
            />
          ))}
        </Section>

        <Section title="Recommended Users">
          {(recommended || []).map((user) => (
            <UserCard
              key={user._id}
              user={user}
              actionLabel="Add Friend"
              onAction={async () => {
                await sendFriendRequest(user._id);
                await fetchData();
              }}
            />
          ))}
        </Section>

        <Section title="Incoming Friend Requests">
          {(incoming || []).map((request) => (
            <UserCard
              key={request._id}
              user={request.sender}
              actionLabel="Accept"
              onAction={async () => {
                await acceptFriendRequest(request._id);
                await fetchData();
              }}
              secondaryActionLabel="Reject"
              onSecondaryAction={async () => {
                await deleteFriendRequest(request._id);
                await fetchData();
              }}
            />
          ))}
        </Section>

        <Section title="Sent Requests">
          {(outgoing || []).map((request) => (
            <UserCard
              key={request._id}
              user={request.receiver}
              actionLabel="Cancel"
              onAction={async () => {
                await deleteFriendRequest(request._id);
                await fetchData();
              }}
            />
          ))}
        </Section>
      </div>
    </>
  );
};

export default HomePage;
