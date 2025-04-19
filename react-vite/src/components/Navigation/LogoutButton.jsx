import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { thunkLogout } from "../../redux/session";

export default function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(thunkLogout());
    navigate("/");
  };

  return (
    <button onClick={handleLogout} className="logout-btn">
      Log out
    </button>
  );
}
