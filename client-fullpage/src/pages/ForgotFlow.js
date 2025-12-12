import React, { useState } from "react";
import ForgotPassword from "./ForgotPassword";
import VerifyOtp from "./VerifyOtp";
import ResetPassword from "./ResetPassword";

export default function ForgotFlow() {
  const [email, setEmail] = useState(null);
  const [resetToken, setResetToken] = useState(null);

  return (
    <div>
      {!email && <ForgotPassword onOtpSent={(e) => setEmail(e)} />}
      {email && !resetToken && (
        <VerifyOtp email={email} onVerified={(token) => setResetToken(token)} />
      )}
      {resetToken && <ResetPassword resetToken={resetToken} />}
    </div>
  );
}
