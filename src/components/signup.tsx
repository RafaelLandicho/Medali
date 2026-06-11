import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Switch } from "@/components/animate-ui/components/radix/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState } from "react";
import { auth, db } from "@/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { set, ref } from "firebase/database";
import { useNavigate } from "react-router-dom";

export function SignUp() {
  const [isDoctor, setIsDoctor] = useState(false);
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    type: "",
    department: "",
    birthMonth: "",
    birthYear: "",
    birthDay: "",
    medicalId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    if (!fields.firstName) newErrors.firstName = "First name is required.";
    if (!fields.email) newErrors.email = "Email is required.";
    if (!fields.username) newErrors.username = "Username is required.";
    if (!fields.password) newErrors.password = "Password is required.";
    if (!fields.birthMonth) newErrors.birthMonth = "Required.";
    if (!fields.birthYear) newErrors.birthYear = "Required.";
    if (!fields.birthDay) newErrors.birthDay = "Required.";
    if (isDoctor && !fields.department)
      newErrors.department = "Department is required.";
    if (isDoctor && !fields.medicalId)
      newErrors.medicalId = "Medical ID is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateFields()) return;
    try {
      const userDetails = await createUserWithEmailAndPassword(
        auth,
        fields.email,
        fields.password,
      );
      const user = userDetails.user;
      await set(ref(db, "users/" + user.uid), {
        firstName: fields.firstName,
        lastName: fields.lastName,
        username: fields.username,
        email: fields.email,
        password: fields.password,
        type: isDoctor ? "doctor" : "secretary",
        medicalId: isDoctor ? fields.medicalId : null,
        field: isDoctor ? fields.department : null,
        requests: [],
        ...(isDoctor ? { secretaries: [] } : { doctors: [] }),
      });
      toast.success("Account created successfully!");
      navigate("/records");
    } catch (error: any) {
      setErrors({ general: error.message });
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSignUp();
      }}
      className="w-full space-y-5"
    >
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            First Name
          </label>
          <Input
            placeholder="First name"
            value={fields.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="h-11"
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Last Name</label>
          <Input
            placeholder="Last name"
            value={fields.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="h-11"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Email</label>
        <Input
          type="email"
          placeholder="example@email.com"
          value={fields.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="h-11"
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
      </div>

      {/* Username */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Username</label>
        <Input
          placeholder="@username"
          value={fields.username}
          onChange={(e) => handleChange("username", e.target.value)}
          className="h-11"
        />
        {errors.username && (
          <p className="text-red-500 text-xs">{errors.username}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Password</label>
        <Input
          type="password"
          placeholder="••••••••"
          value={fields.password}
          onChange={(e) => handleChange("password", e.target.value)}
          className="h-11"
        />
        {errors.password && (
          <p className="text-red-500 text-xs">{errors.password}</p>
        )}
      </div>

      {/* Date of Birth */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Date of Birth
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Select
              value={fields.birthMonth}
              onValueChange={(v) => handleChange("birthMonth", v)}
            >
              <SelectTrigger className="h-11 !bg-[#00a896] !text-white">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = String(i + 1).padStart(2, "0");
                  return (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.birthMonth && (
              <p className="text-red-500 text-xs mt-1">{errors.birthMonth}</p>
            )}
          </div>
          <div>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Day"
              value={fields.birthDay}
              onChange={(e) => handleChange("birthDay", e.target.value)}
              className="h-11"
            />
            {errors.birthDay && (
              <p className="text-red-500 text-xs mt-1">{errors.birthDay}</p>
            )}
          </div>
          <div>
            <Select
              value={fields.birthYear}
              onValueChange={(v) => handleChange("birthYear", v)}
            >
              <SelectTrigger className="h-11 !bg-[#00a896] !text-white">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 76 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.birthYear && (
              <p className="text-red-500 text-xs mt-1">{errors.birthYear}</p>
            )}
          </div>
        </div>
      </div>

      {/* Doctor toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
        <div>
          <p className="text-sm font-medium text-gray-700">Are you a Doctor?</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Toggle to sign up as a doctor
          </p>
        </div>
        <Switch checked={isDoctor} onCheckedChange={setIsDoctor} />
      </div>

      {/* Doctor-only fields — stacked, not inside a conditional that breaks layout */}
      {isDoctor && (
        <div className="space-y-4 p-4 rounded-xl border border-[#00c4b4]/30 bg-[#00a896]/5">
          <p className="text-xs font-semibold text-[#00a896] uppercase tracking-wider">
            Doctor Details
          </p>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Department
            </label>
            <Select
              value={fields.department}
              onValueChange={(v) => handleChange("department", v)}
            >
              <SelectTrigger className="h-11 !bg-[#00a896] !text-white w-full">
                <SelectValue placeholder="Choose department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Family Medicine">Family Medicine</SelectItem>
                <SelectItem value="Internal Medicine">
                  Internal Medicine
                </SelectItem>
                <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                <SelectItem value="Radiology">Radiology</SelectItem>
                <SelectItem value="General Surgery">General Surgery</SelectItem>
                <SelectItem value="Obstetrics and Gynecology">
                  Obstetrics and Gynecology
                </SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
            {errors.department && (
              <p className="text-red-500 text-xs">{errors.department}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Medical ID
            </label>
            <div className="flex justify-center py-2">
              <InputOTP
                maxLength={9}
                value={fields.medicalId}
                onChange={(value) => handleChange("medicalId", value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={6} />
                  <InputOTPSlot index={7} />
                  <InputOTPSlot index={8} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {errors.medicalId && (
              <p className="text-red-500 text-xs text-center">
                {errors.medicalId}
              </p>
            )}
          </div>
        </div>
      )}

      {errors.general && (
        <p className="text-red-500 text-sm">{errors.general}</p>
      )}

      <Button
        type="submit"
        className="w-full h-11 !bg-[#00a896] hover:!bg-[#028090] !text-white font-medium rounded-xl"
      >
        Create Account
      </Button>
    </form>
  );
}
