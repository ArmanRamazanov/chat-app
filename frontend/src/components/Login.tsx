import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginFormData } from "@/schemas/auth";

import "@/styles/auth.css";
import { setLocalStorage } from "@/utils/localStorage";
import { isCustomError } from "@/types/index.types";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      const accessToken = result.data;

      if (result.success) {
        setLocalStorage("token", accessToken);
        navigate("/main");
      } else {
        throw {
          error: result.message,
        };
      }
    } catch (error) {
      if (isCustomError(error)) {
        if (typeof error.error === "object") {
          error.error.forEach((errorObject) => {
            setError(errorObject.field as keyof LoginFormData, {
              message: errorObject.message,
            });
          });
        } else {
          setError("root", {
            message: error.error,
          });
        }
      } else {
        setError("root", {
          message: "Something went wrong",
        });
      }

      setTimeout(() => {
        setError("root", {
          message: "",
        });
      }, 3000);
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <h1>Login</h1>

        <label>
          Username
          <input
            type="text"
            placeholder="Enter username"
            {...register("username")}
          />
        </label>
        {errors.username && (
          <span className="error">{errors.username.message}</span>
        )}

        <label>
          Password
          <input
            type="password"
            placeholder="Enter password"
            {...register("password")}
          />
        </label>
        {errors.password && (
          <span className="error">{errors.password.message}</span>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
        {errors.root && <span className="error">{errors.root.message}</span>}

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
