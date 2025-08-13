import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    setLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      toast.success("Accesso effettuato con successo!");
      navigate("/");
      setLoading(false);
    }, 1000);
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
};

export default Login;