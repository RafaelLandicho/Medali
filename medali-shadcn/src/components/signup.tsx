import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Switch } from "@/components/animate-ui/components/radix/switch";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldContent,
} from "@/components/ui/field";
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
    if (!fields.birthMonth) newErrors.birthMonth = "Birth month is required.";
    if (!fields.birthYear) newErrors.birthYear = "Birth year is required.";
    if (!fields.birthDay) newErrors.birthDay = "Birth day is required.";
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
    <div className="w-screen max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSignUp();
        }}
      >
        <FieldGroup>
          <FieldSet>
            <Field>
              <FieldLabel>First Name</FieldLabel>
              <Input
                placeholder="First Name"
                value={fields.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
              {errors.firstName && (
                <p className="text-red-600">{errors.firstName}</p>
              )}
            </Field>

            <Field>
              <FieldLabel>Last Name</FieldLabel>
              <Input
                placeholder="Last Name"
                value={fields.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                placeholder="@email.com"
                value={fields.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && <p className="text-red-600">{errors.email}</p>}
            </Field>

            <Field>
              <FieldLabel>Username</FieldLabel>
              <Input
                placeholder="Add a username"
                value={fields.username}
                onChange={(e) => handleChange("username", e.target.value)}
              />
              {errors.username && (
                <p className="text-red-600">{errors.username}</p>
              )}
            </Field>

            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input
                type="password"
                placeholder="********"
                value={fields.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              {errors.password && (
                <p className="text-red-600">{errors.password}</p>
              )}
            </Field>

            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel>Are you a Doctor?</FieldLabel>
                <FieldDescription>
                  Toggle to sign up as a doctor
                </FieldDescription>
              </FieldContent>
              <Switch checked={isDoctor} onCheckedChange={setIsDoctor} />
            </Field>

            {isDoctor && (
              <>
                <Field>
                  <FieldLabel>Department</FieldLabel>
                  <Select
                    value={fields.department}
                    onValueChange={(value) => handleChange("department", value)}
                  >
                    <SelectTrigger className="!bg-blue-400 !text-white ">
                      <SelectValue placeholder="Choose department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Family Medicine">
                        Family Medicine
                      </SelectItem>
                      <SelectItem value="Internal Medicine">
                        Internal Medicine
                      </SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                      <SelectItem value="Radiology">Radiology</SelectItem>
                      <SelectItem value="General Surgery">
                        General Surgery
                      </SelectItem>
                      <SelectItem value="Obstetrics and Gynecology">
                        Obstetrics and Gynecology
                      </SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-red-600">{errors.department}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Medical ID</FieldLabel>
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
                  {errors.medicalId && (
                    <p className="text-red-600">{errors.medicalId}</p>
                  )}
                </Field>
              </>
            )}

            <div className="grid grid-cols-3 gap-4 relative">
              <Field>
                <FieldLabel>Month</FieldLabel>
                <Select
                  value={fields.birthMonth}
                  onValueChange={(value) => handleChange("birthMonth", value)}
                >
                  <SelectTrigger className="!bg-blue-400 !text-white">
                    <SelectValue placeholder="MM" />
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
                  <p className="text-red-600">{errors.birthMonth}</p>
                )}
              </Field>

              <Field>
                <FieldLabel>Year</FieldLabel>
                <Select
                  value={fields.birthYear}
                  onValueChange={(value) => handleChange("birthYear", value)}
                >
                  <SelectTrigger className="!bg-blue-400 !text-white">
                    <SelectValue placeholder="YYYY" />
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
                  <p className="text-red-600">{errors.birthYear}</p>
                )}
              </Field>

              <Field>
                <FieldLabel>Day</FieldLabel>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="DD"
                  value={fields.birthDay}
                  onChange={(e) => handleChange("birthDay", e.target.value)}
                />
                {errors.birthDay && (
                  <p className="text-red-600">{errors.birthDay}</p>
                )}
              </Field>
            </div>

            {errors.general && (
              <p className="text-red-600 mt-2">{errors.general}</p>
            )}
          </FieldSet>

          <Field orientation="horizontal">
            <Button type="submit" className="!bg-blue-500 !text-white">
              Submit
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
