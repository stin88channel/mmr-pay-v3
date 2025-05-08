import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PasswordStrength {
  score: number;
  feedback: string;
}

const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, feedback: 'Введите пароль' };
  }

  let score = 0;
  const feedback: string[] = [];

  // Длина пароля
  if (password.length < 8) {
    feedback.push('Пароль должен быть не менее 8 символов');
  } else {
    score += Math.min(password.length * 2, 20);
  }

  // Наличие заглавных букв
  if (!/[A-Z]/.test(password)) {
    feedback.push('Добавьте заглавные буквы');
  } else {
    score += 15;
  }

  // Наличие строчных букв
  if (!/[a-z]/.test(password)) {
    feedback.push('Добавьте строчные буквы');
  } else {
    score += 15;
  }

  // Наличие цифр
  if (!/\d/.test(password)) {
    feedback.push('Добавьте цифры');
  } else {
    score += 15;
  }

  // Наличие специальных символов
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Добавьте специальные символы');
  } else {
    score += 15;
  }

  // Дополнительные баллы за разнообразие
  const uniqueChars = new Set(password).size;
  score += Math.min(uniqueChars * 2, 20);

  let strengthFeedback = '';
  if (score >= 80) {
    strengthFeedback = 'Отличный пароль';
  } else if (score >= 60) {
    strengthFeedback = 'Хороший пароль';
  } else if (score >= 40) {
    strengthFeedback = 'Средний пароль';
  } else if (score >= 20) {
    strengthFeedback = 'Слабый пароль';
  } else {
    strengthFeedback = 'Очень слабый пароль';
  }

  return {
    score: Math.min(score, 100),
    feedback: feedback.length > 0 ? feedback.join(', ') : strengthFeedback
  };
};

const getStrengthColor = (score: number): string => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-green-400';
  if (score >= 40) return 'bg-yellow-500';
  if (score >= 20) return 'bg-orange-500';
  return 'bg-red-500';
};

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    if (passwordStrength.score < 60) {
      toast.error('Пароль слишком слабый');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        login: username,
        email,
        password,
        phoneNumber,
        typeOfAccount: 'personal'
      });
      toast.success('Регистрация успешна');
      navigate('/auth/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-2xl">
        <Card className="bg-card p-6">
          <CardHeader className="space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex justify-center"
            >
              <img src="/assets/mmr_logo.png" alt="MMR Logo" className="h-12 w-auto" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-center">Регистрация</CardTitle>
            <CardDescription className="text-center">
              Создайте новый аккаунт
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="username">Имя пользователя</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    className="w-full"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="phoneNumber">Номер телефона</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+7 (999) 999-99-99"
                    className="w-full"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {password && (
                    <div className="space-y-2 mt-2">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength.score}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-full ${getStrengthColor(passwordStrength.score)}`}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">{passwordStrength.feedback}</p>
                    </div>
                  )}
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="space-y-2"
              >
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
              </motion.div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.8 }}
              className="text-sm text-center text-muted-foreground"
            >
              Уже есть аккаунт?{' '}
              <Link to="/auth/login" className="text-primary hover:underline">
                Войти
              </Link>
            </motion.div>
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  );
} 