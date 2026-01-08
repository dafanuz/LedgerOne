import supabase from "@/utils/supabase";

export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface AuthResponse {
    success: boolean;
    error?: string;
    validationErrors?: ValidationError[];
    data?: any;
}

class AuthService {
    // Validate registration form      
    validateRegisterForm(data: RegisterFormData): ValidationError[] {
        const errors: ValidationError[] = [];

        // Name validation
        if (!data.name.trim()) {
            errors.push({ field: 'name', message: 'Name is required' });
        } else if (data.name.trim().length < 2) {
            errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email.trim()) {
            errors.push({ field: 'email', message: 'Email is required' });
        } else if (!emailRegex.test(data.email)) {
            errors.push({ field: 'email', message: 'Invalid email format' });
        }

        // Password validation
        if (!data.password) {
            errors.push({ field: 'password', message: 'Password is required' });
        } else if (data.password.length < 6) {
            errors.push({
                field: 'password', message: 'Password must be at least 6 characters'
            });
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
            errors.push({
                field: 'password',
                message: 'Password must contain uppercase, lowercase, and number'
            });
        }

        // Confirm password validation
        if (!data.confirmPassword) {
            errors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
        } else if (data.password !== data.confirmPassword) {
            errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
        }

        return errors;
    }

    // Register new user
    async register(data: any): Promise<AuthResponse> {
        try {
            // Validate form data
            const validationErrors = this.validateRegisterForm(data);
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    validationErrors,
                };
            }

            console.log("Registering user with Supabase:", data);
            // Register user with Supabase
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        name: data.name,
                    },
                },
            });

            if (signUpError) {
                return {
                    success: false,
                    error: signUpError.message,
                };
            }

            // Check if email confirmation is required
            if (authData.user && !authData.session) {
                return {
                    success: true,
                    data: authData.user,
                    error: 'Please check your email to confirm your account',
                };
            }

            return {
                success: true,
                data: authData.user,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred',
            };
        }
    }

    // Login user
    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return {
                    success: false,
                    error: error.message,
                };
            }

            return {
                success: true,
                data: data,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred',
            };
        }
    }

    // Logout user
    async logout(): Promise<AuthResponse> {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                return {
                    success: false,
                    error: error.message,
                };
            }

            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred',
            };
        }
    }

    // Get current user
    async getProfile(userId: string) {
        if (!userId) return null;

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) {
            console.error("getProfile error:", error);
            return null;
        }

        return data;
    }

     async getSettings(userId: string) {
        if (!userId) return null;

        const { data, error } = await supabase
            .from("user_settings")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) {
            console.error("getSettings error:", error);
            return null;
        }

        return data;
    }

    async getInitialSession() {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        return data.session
    }

    // Listen to auth state changes
    subscribeAuthState(callback: (session: any) => void) {
        const { data: subscription } =
            supabase.auth.onAuthStateChange((_event, session) => {
                callback(session)
            })

        return subscription
    }

}

export default new AuthService();