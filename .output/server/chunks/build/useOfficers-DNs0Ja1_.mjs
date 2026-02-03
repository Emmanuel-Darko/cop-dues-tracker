import { u as useSupabaseClient } from './useSupabaseClient-DxYTVa8G.mjs';

const useOfficers = () => {
  const supabase = useSupabaseClient();
  const getOfficers = async () => {
    const { data, error } = await supabase.from("officers").select("*").order("full_name");
    return { data, error };
  };
  const addOfficer = async (officer) => {
    const { data, error } = await supabase.from("officers").insert([officer]).select().single();
    return { data, error };
  };
  const updateOfficer = async (id, updates) => {
    const { data, error } = await supabase.from("officers").update({ ...updates, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    return { data, error };
  };
  const deleteOfficer = async (id) => {
    const { error } = await supabase.from("officers").delete().eq("id", id);
    return { error };
  };
  return {
    getOfficers,
    addOfficer,
    updateOfficer,
    deleteOfficer
  };
};

export { useOfficers as u };
//# sourceMappingURL=useOfficers-DNs0Ja1_.mjs.map
