import "@/styles/header.css";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <Link to="/login">Login</Link>
    </header>
  );
}
