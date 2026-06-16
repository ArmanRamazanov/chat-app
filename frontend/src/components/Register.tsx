import { registerSchema, type RegisterFormData } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useState } from "react";

import "@/styles/auth.css";
import { isCustomError } from "@/types/index.types";

export default function Register() {
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Successfully registered!");
      } else {
        if (result.message) {
          throw {
            error: result.message,
          };
        }
        if (result.data) {
          throw {
            error: result.data,
          };
        }
      }
    } catch (error) {
      if (isCustomError(error)) {
        if (typeof error.error === "object") {
          error.error.forEach((errorObject) => {
            setError(errorObject.field as keyof RegisterFormData, {
              message: errorObject.message,
            });

            setTimeout(() => {
              setError(errorObject.field as keyof RegisterFormData, {
                message: "",
              });
            }, 3000);
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
      {successMessage && <div className="success">{successMessage}</div>}
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <h1>Register</h1>

        <label>
          First Name
          <input
            type="text"
            placeholder="Enter first name"
            {...register("firstName")}
          />
        </label>
        {errors.firstName && (
          <span className="error">{errors.firstName.message}</span>
        )}

        <label>
          Username
          <input
            type="text"
            placeholder="Choose username"
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
            placeholder="Create password"
            {...register("password")}
          />
        </label>
        {errors.password && (
          <span className="error">{errors.password.message}</span>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
        {errors.root && <span className="error">{errors.root.message}</span>}

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
