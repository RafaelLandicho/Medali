import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { auth } from "@/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export function Login() {
  const [fields, setFields] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" })); // clear error on change
  };

  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    if (!fields.email) newErrors.email = "Email is required.";
    if (!fields.password) newErrors.password = "Password is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return; // stop if validation fails

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        fields.email,
        fields.password,
      );
      const user = userCredential.user;
      const token = await user.getIdToken();
      sessionStorage.setItem("accessToken", token);
      navigate("/records");
    } catch (err: any) {
      // map Firebase errors to UI
      switch (err.code) {
        case "auth/user-not-found":
          setErrors({ email: "No user found with this email." });
          break;
        case "auth/wrong-password":
          setErrors({ password: "Incorrect password. Please try again." });
          break;
        case "auth/invalid-email":
          setErrors({ email: "Invalid email address." });
          break;
        default:
          setErrors({ general: "Login failed. Please try again later." });
      }
    }
  };

  return (
    <div className="w-screen max-w-md text">
      <form onSubmit={handleLogin}>
        <FieldGroup>
          <FieldSet>
            <Field>
              <FieldLabel className="text-l font-medium">Email</FieldLabel>
              <Input
                className="!h-12 !text-l"
                type="email"
                placeholder="example@email.com"
                value={fields.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && (
                <p className="!text-red-600 !text-l !mt-2">{errors.email}</p>
              )}
            </Field>

            <Field>
              <FieldLabel className="text-l font-medium">Password</FieldLabel>
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
              <Input
                className="!h-12 !text-lg"
                type="password"
                placeholder="********"
                value={fields.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              {errors.password && (
                <p className="!text-red-600 !text-lg !mt-2">
                  {errors.password}
                </p>
              )}
            </Field>

            {errors.general && (
              <p className="!text-red-600 !text-lg !mt-2">{errors.general}</p>
            )}
          </FieldSet>

          <Field orientation="horizontal">
            <div className="flex items-center justify-center w-full">
              <Button
                type="submit"
                className="!bg-[#00a896] !text-white border border-none rounded-none  "
              >
                Login
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
