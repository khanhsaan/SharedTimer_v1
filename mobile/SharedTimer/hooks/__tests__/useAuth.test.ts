import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '@/app/hooks/useAuth';
import { supabase } from '@/lib/supabase';

jest.mock