public ErreurMessage GET_INSERT_BORDEREAU_REGROUPE(SqlTransaction paramTransaction, BorderauEncaissable_Collection lstBordereau, Guid TransactionId, string Numero_Operation,
                            Guid SessionId, Guid MoyenDeReglementId, Guid ROWID_PERSONNE, Guid BUSINESSUNIT, Guid ORGANISATION, string refRegroupement, string CodeMoyenReglement, 
                            decimal montantAccompte, Guid compteAccompteId, Guid agenceBanqueId, string numeroCheque, string numeroCompte, string nomEmetteur)
{
    Logger.ClassInf = typeof(LigneCompteClient_DAL);
    ErreurMessage bResults = new ErreurMessage();
    SqlCommand command = null;
    int testAccompte = 0;

    try
    {
        // -------------------------------------------------------------
        // 1. PREPARATION DES DONNEES (TVP) - RAPIDE (EN MEMOIRE)
        // -------------------------------------------------------------
        
        // Création des structures de tables pour SQL
        DataTable dtBordereaux = new DataTable();
        dtBordereaux.Columns.Add("Id", typeof(Guid));

        DataTable dtFactures = new DataTable();
        dtFactures.Columns.Add("Id", typeof(Guid));

        // Remplissage des tables à partir de la collection
        foreach (BorderauEncaissable itemBordereau in lstBordereau)
        {
            // Ajout de l'ID Bordereau
            if (itemBordereau.BordereauId != Guid.Empty)
            {
                dtBordereaux.Rows.Add(itemBordereau.BordereauId);
            }

            // Ajout des IDs Factures (Gestion des exclusions/inclusions)
            if (itemBordereau.ListeFacture != null && itemBordereau.ListeFacture.Count > 0)
            {
                foreach (var facture in itemBordereau.ListeFacture)
                {
                    if (facture.FactureId != Guid.Empty)
                    {
                        dtFactures.Rows.Add(facture.FactureId);
                    }
                }
            }

            // Vérification de la condition d'accompte (Logique conservée)
            // Si au moins un bordereau correspond au compte d'accompte, on active le flag
            if (compteAccompteId != Guid.Empty && montantAccompte > 0 && itemBordereau.CompteRegroupementId == compteAccompteId)
            {
                testAccompte = 1;
            }
        }

        // -------------------------------------------------------------
        // 2. APPEL UNIQUE A LA BASE DE DONNEES
        // -------------------------------------------------------------

        command = new SqlCommand("usp_GS2E_INSERT_BORDEREAU_REGROUPE", paramTransaction.Connection, paramTransaction);
        command.CommandType = CommandType.StoredProcedure;
        command.CommandTimeout = 300; // Augmenté à 5 min pour sécurité sur gros volumes

        // --- Paramètres TVP (Les Tables) ---
        
        SqlParameter param_BordereauIds = command.Parameters.AddWithValue("@BordereauIds", dtBordereaux);
        param_BordereauIds.SqlDbType = SqlDbType.Structured;
        param_BordereauIds.TypeName = "dbo.IdListType"; // DOIT CORRESPONDRE AU TYPE CREE EN SQL

        SqlParameter param_FactureIds = command.Parameters.AddWithValue("@FactureBordereauIds", dtFactures);
        param_FactureIds.SqlDbType = SqlDbType.Structured;
        param_FactureIds.TypeName = "dbo.IdListType";

        // --- Paramètres Scalaires (Classiques) ---

        command.Parameters.AddWithValue("@TransactionId", TransactionId);
        command.Parameters.AddWithValue("@Numero_Operation", (object)Numero_Operation ?? DBNull.Value);
        command.Parameters.AddWithValue("@SessionId", SessionId);
        command.Parameters.AddWithValue("@MoyenDeReglementId", MoyenDeReglementId);
        command.Parameters.AddWithValue("@ROWID_PERSONNE", ROWID_PERSONNE);
        command.Parameters.AddWithValue("@BUSINESSUNIT", BUSINESSUNIT);
        command.Parameters.AddWithValue("@ORGANISATION", ORGANISATION);
        command.Parameters.AddWithValue("@refRegroupement", (object)refRegroupement ?? DBNull.Value);
        command.Parameters.AddWithValue("@CodeMoyenReglement", (object)CodeMoyenReglement ?? DBNull.Value);
        
        command.Parameters.AddWithValue("@montantAccompte", montantAccompte);
        command.Parameters.AddWithValue("@compteAccompteId", compteAccompteId);
        command.Parameters.AddWithValue("@agenceBanqueId", agenceBanqueId);
        
        command.Parameters.AddWithValue("@numeroCheque", (object)numeroCheque ?? DBNull.Value);
        command.Parameters.AddWithValue("@numeroCompte", (object)numeroCompte ?? DBNull.Value);
        command.Parameters.AddWithValue("@numeroEmetteur", (object)nomEmetteur ?? DBNull.Value);
        
        command.Parameters.AddWithValue("@testAccompte", testAccompte);

        // Logging des paramètres pour le debug
        foreach (SqlParameter item in command.Parameters)
        {
            string val = item.Value != null ? item.Value.ToString() : "NULL";
            if (item.SqlDbType == SqlDbType.Structured) val = "(Table Structured)";
            Logger.myLogger.Debug(string.Concat("Le parametre ", item.ParameterName, " a pour valeur ", val));
        }

        // Exécution unique
        command.ExecuteNonQuery();

    }
    catch (Exception ex)
    {
        bResults.CodeErreur = eCodeErreur.Error;
        Logger.myLogger.Error(string.Concat("Une erreur s'est produite. ExceptionErreur: {0}", ex.Message));
        bResults.MessageErreur = String.Format(Resources.MESSAGE_GENERIC_ERROR, ex.GetType().Name, ex.Message);
        
        // Optionnel : Relancer l'exception si vous voulez que la transaction parente le sache
        throw; 
    }
    finally
    {
        if (command != null) command.Dispose();
    }

    Logger.myLogger.Debug(string.Concat("Le resultat contient ", bResults.MessageErreur != null ? bResults.MessageErreur.ToString() : " Ok"));
    return bResults;
}