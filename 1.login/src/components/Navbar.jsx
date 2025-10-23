import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  return (
    <nav>
      {Array.from({ length: 20 }, (_, i) => (
        <Link key={i} to={`/page/${i + 1}`}>
          Page {i + 1}
        </Link>
      ))}
      <button onClick={() => supabase.auth.signOut()}>Logout</button>
    </nav>
  );
}
