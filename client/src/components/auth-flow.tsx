"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Loader2, Check } from "lucide-react" 
import { Alert, AlertDescription } from "@/components/ui/alert"
import { API_URL } from "@/lib/config"

export function AuthFlow() {
  const [activeTab, setActiveTab] = useState("login")
  
  // NEW: View state ("login" vs "forgot")
  const [view, setView] = useState<"login" | "forgot">("login")
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Login form
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register form
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")

  // Forgot Password form
  const [resetEmail, setResetEmail] = useState("")
  const [resetOtp, setResetOtp] = useState("")
  const [newPass, setNewPass] = useState("")
  const [resetStep, setResetStep] = useState(1) // 1=Email, 2=OTP+Pass

  const { login, sendOtp, register } = useAuth()

  // --- HANDLERS ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await login(loginUsername, loginPassword)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await sendOtp(email, username)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await register(email, username, password, fullName, otp)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Request Password Reset OTP
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
        const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: resetEmail })
        })
        if (!res.ok) throw new Error("Failed to send OTP")
        setResetStep(2)
    } catch(err) { setError("User not found or error sending email") }
    finally { setIsLoading(false) }
  }

  // Submit Password Reset
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
        const res = await fetch(`${API_URL}/api/auth/reset-password`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: resetEmail, otp: resetOtp, new_password: newPass })
        })
        if (!res.ok) throw new Error("Invalid OTP or expired")
        
        alert("Password reset successful! Please login.")
        setView("login")
        setResetStep(1)
        setResetEmail("")
        setResetOtp("")
        setNewPass("")
    } catch(err) { setError("Failed to reset password") }
    finally { setIsLoading(false) }
  }

  // --- VALIDATION LOGIC ---
  const isLengthValid = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const isPasswordValid = isLengthValid && hasNumber;

  // --- RENDER FORGOT PASSWORD VIEW ---
  if (view === "forgot") {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>Enter your email to receive a code.</CardDescription>
            </CardHeader>
            <CardContent>
                {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
                
                {resetStep === 1 ? (
                    <form onSubmit={handleForgotRequest} className="space-y-4">
                        <Input placeholder="Enter your email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} disabled={isLoading} />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : "Send OTP"}
                        </Button>
                        <Button type="button" variant="ghost" className="w-full" onClick={() => setView("login")} disabled={isLoading}>Back to Login</Button>
                    </form>
                ) : (
                    <form onSubmit={handleResetSubmit} className="space-y-4">
                        <Input placeholder="Enter OTP" value={resetOtp} onChange={e => setResetOtp(e.target.value)} disabled={isLoading} />
                        <Input type="password" placeholder="New Password" value={newPass} onChange={e => setNewPass(e.target.value)} disabled={isLoading} />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : "Reset Password"}
                        </Button>
                        <Button type="button" variant="ghost" className="w-full" onClick={() => setResetStep(1)} disabled={isLoading}>Change Email</Button>
                    </form>
                )}
            </CardContent>
          </Card>
        </div>
      )
  }

  // --- RENDER LOGIN/REGISTER VIEW ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Social Media</CardTitle>
          <CardDescription>Share your moments</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-3">
                <Input
                  placeholder="Username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={isLoading}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
                
                {/* Forgot Password Link */}
                <div className="text-center mt-2">
                    <button type="button" onClick={() => setView("forgot")} className="text-sm text-blue-600 hover:underline">
                        Forgot Password?
                    </button>
                </div>
              </form>
            </TabsContent>

            {/* REGISTER TAB */}
            <TabsContent value="register" className="space-y-4 mt-4">
              {step === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                  <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading} />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP...</> : "Send OTP"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3">
                  <Input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} />
                  <Input placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} disabled={isLoading} />
                  
                  <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                  
                  {/* Password Requirements Checklist */}
                  <div className="text-xs space-y-1 mt-2 p-2 bg-secondary/30 rounded-md">
                    <p className="font-medium text-muted-foreground mb-1">Password must have:</p>
                    <div className={`flex items-center gap-2 ${isLengthValid ? "text-green-600" : "text-muted-foreground"}`}>
                        {isLengthValid ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 border border-current rounded-full" />}
                        <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${hasNumber ? "text-green-600" : "text-muted-foreground"}`}>
                        {hasNumber ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 border border-current rounded-full" />}
                        <span>At least one number</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading || !isPasswordValid}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</> : "Register"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full bg-transparent" onClick={() => setStep(1)} disabled={isLoading}>Back</Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}