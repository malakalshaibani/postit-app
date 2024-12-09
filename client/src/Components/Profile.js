import { useState, useEffect } from "react";
import {
  Form,
  FormGroup,
  Input,
  Label,
  Button,
  Container,
  Row,
  Col,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import User from '../Components/User.js';
import { updateUserProfile } from "../Features/UserSlice";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  // Retrieve the user details from Redux store.
  const user = useSelector((state) => state.users.user);
  
  // Initialize state variables. Ensure `user` is an object, not null.
  const [userName, setUserName] = useState(user?.name || "");  // Fallback to empty string if user is null
  const [pwd, setPwd] = useState(user?.password || "");         // Fallback
  const [confirmPassword, setConfirmPassword] = useState(user?.password || ""); // Fallback
  const [email, setEmail] = useState(user?.email || "");        // Fallback
  const [profilePic, setProfilePic] = useState(user?.profilePic || ""); // Fallback
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Function to handle file input change
  const handleFileChange = (event) => {
    const uploadFile = event.target.files[0];
    if (uploadFile) {
      setProfilePic(uploadFile);
    } else {
      alert("No file uploaded");
    }
  };

  const handleUpdate = (event) => {
    event.preventDefault();

    // Check if password and confirm password match
    if (pwd !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Prepare the user data object with the current user's email and updated details
    const userData = {
      email: email,  // Email can be updated
      name: userName,
      password: pwd,
      profilePic: profilePic,
    };

    // Dispatch the updateUserProfile action to update the user profile in the Redux store
    dispatch(updateUserProfile(userData));
    alert("Profile Updated.");

    // Navigate back to the profile page after the update is completed
    navigate("/profile");
  };

  // Render loading message until user data is available
  if (!user) {
    return <p>Loading...</p>;  // This will now show the loading message when user is still undefined or null
  }

  return (
    <Container fluid>
      <h1>Profile</h1>
      <Row>
        <Col md={2}>
          <User />
        </Col>
        <Col md={4}>
          <h2>Update Profile</h2>
          <Form onSubmit={handleUpdate}>
            <FormGroup>
              <Label for="profilePic">Profile Picture</Label>
              <Input
                type="file"
                name="profilePic"
                onChange={handleFileChange}
              />
            </FormGroup>

            <FormGroup>
              <Label for="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Name..."
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label for="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="Email..."
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label for="password">Password</Label>
              <Input
                id="password"
                name="password"
                placeholder="Password..."
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label for="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm Password..."
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Button color="primary" type="submit" className="button">
                Update Profile
              </Button>
            </FormGroup>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
