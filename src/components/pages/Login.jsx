import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/App";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";

function Login() {
  const { isInitialized } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  useEffect(() => {
    if (isInitialized) {
      // Show Italian login UI in this component
      const { ApperUI } = window.ApperSDK;
      ApperUI.showLogin("#authentication");
    }
  }, [isInitialized]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Handle login logic here
      console.log('Login attempt:', formData);
      // navigate to dashboard or appropriate page
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-primary bg-clip-text text-transparent">
            <h1 className="text-4xl font-bold mb-2">Talent Scanner</h1>
          </div>
          <p className="text-gray-600">Accedi al tuo account</p>
        </div>

<Card className="p-8 shadow-xl bg-white/80 backdrop-blur-sm">
          <div id="authentication" />
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="inserisci@email.com"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Inserisci la tua password"
              required
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full bg-gradient-primary"
            >
              Accedi
            </Button>

            <div className="text-center pt-4">
              <p className="text-gray-600">
                Non hai un account?{" "}
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Registrati qui
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default Login;