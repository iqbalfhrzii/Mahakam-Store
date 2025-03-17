import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <>
      <div>
        <h1>Home</h1>
        <p>Welcome to the Home Page untuk User</p>
        <Link to="/addAdmin">addAdmin</Link>
      </div>
    </>
  );
}

export default LandingPage;
