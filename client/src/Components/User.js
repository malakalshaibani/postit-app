import { useSelector } from "react-redux";
import userimg from "../Images/user.png"; // Fallback image

const User = () => {
  // Access user data from Redux store
  const user = useSelector((state) => state.users.user);

  // Ensure the user object exists before accessing its properties
  if (!user) {
    return <p>Loading...</p>; // Optionally show a loading state
  }

  // Use the profilePic or fallback image
  const picURL = user.profilePic ? "http://localhost:3001/uploads/" + user.profilePic : userimg;

  return (
    <div>
      <img src={picURL} alt="User Profile" className="userImage" />
      <p>
        <b>{user.name}</b>
        <br />
        {user.email}
      </p>
    </div>
  );
};

export default User;
