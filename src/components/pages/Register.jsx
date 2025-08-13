import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AuthContext } from "@/App";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";

function Register() {
  const { isInitialized } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    brand: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (isInitialized) {
      // Show signup UI in this component
      const { ApperUI } = window.ApperSDK;
      ApperUI.showSignup("#authentication");
    }
  }, [isInitialized]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const generateBrandSlug = (brand) => {
    return brand.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const generatePreviewUrl = () => {
    if (formData.brand) {
      const slug = generateBrandSlug(formData.brand);
      return `talentscanner.app/${slug}/questionario`;
    }
    return "talentscanner.app/il-tuo-brand/questionario";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requiredFields = ['firstName', 'lastName', 'company', 'brand', 'email', 'password'];
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Le password non coincidono");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("La password deve essere di almeno 6 caratteri");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Inserisci un indirizzo email valido");
      return;
    }

    setLoading(true);
    try {
      // Registration logic would go here
      toast.success("Account creato con successo!");
      navigate("/login");
    } catch (error) {
      toast.error("Errore durante la registrazione");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="bg-gradient-primary bg-clip-text text-transparent">
            <h1 className="text-4xl font-bold mb-2">Talent Scanner</h1>
          </div>
          <p className="text-gray-600">Crea il tuo account cliente</p>
        </div>

        <Card className="p-8 shadow-xl bg-white/80 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Personali</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome *"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Il tuo nome"
                  required
                />
                <Input
                  label="Cognome *"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Il tuo cognome"
                  required
                />
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Azienda</h3>
              <div className="space-y-4">
                <Input
                  label="Nome Azienda *"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Es. XYZ srl"
                  required
                />
                <Input
                  label="Brand *"
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Es. ABC"
                  required
                />
                
                {/* URL Preview */}
                <div className="bg-gradient-to-r from-primary-50 to-purple-50 p-4 rounded-lg border border-primary-100">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary-500 rounded-full p-2 flex-shrink-0">
                      <ApperIcon name="Link" size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Il tuo link personalizzato:
                      </h4>
                      <div className="bg-white px-3 py-2 rounded border font-mono text-sm text-primary-600 break-all">
                        {generatePreviewUrl()}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Tutti i questionari compilati su questo link saranno visualizzati nella tua dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contatti</h3>
              <div className="space-y-4">
                <Input
                  label="Email *"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="inserisci@email.com"
                  required
                />
                <Input
                  label="Numero di Telefono (opzionale)"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+39 123 456 7890"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sicurezza</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Password *"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimo 6 caratteri"
                  required
                />
                <Input
                  label="Conferma Password *"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ripeti la password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full bg-gradient-primary"
            >
              Crea Account
            </Button>

            <div className="text-center pt-4">
              <p className="text-gray-600">
                Hai già un account?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Accedi qui
                </Link>
              </p>
            </div>
          </form>
        </Card>

        <div id="authentication" />
      </div>
    </div>
  );
}

export default Register;