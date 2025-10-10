import { supabase } from "@/integrations/supabase/client";

export const updateAllGymLocationsToIndore = async () => {
  try {
    const { data, error } = await supabase
      .from('gyms')
      .update({ location: 'Indore' })
      .neq('location', 'Indore'); // Only update gyms not already set to Indore

    if (error) throw error;

    console.log('Successfully updated gym locations to Indore:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error updating gym locations:', error);
    return { success: false, error };
  }
};
