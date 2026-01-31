-- À exécuter UNE SEULE FOIS pour créer le type
IF TYPE_ID(N'dbo.IdListType') IS NULL
BEGIN
    CREATE TYPE dbo.IdListType AS TABLE ( Id UNIQUEIDENTIFIER PRIMARY KEY );
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[usp_GS2E_INSERT_BORDEREAU_REGROUPE]
    -- Remplacement des varchar(max) par les TVP pour la performance
    @BordereauIds dbo.IdListType READONLY,       
    @FactureBordereauIds dbo.IdListType READONLY, 
    
    -- Paramètres standards inchangés
    @TransactionId UNIQUEIDENTIFIER,
    @Numero_Operation varchar(50) = NULL,
    @SessionId UNIQUEIDENTIFIER,
    @MoyenDeReglementId UNIQUEIDENTIFIER,
    @ROWID_PERSONNE UNIQUEIDENTIFIER,
    @BUSINESSUNIT UNIQUEIDENTIFIER,
    @ORGANISATION UNIQUEIDENTIFIER,
    @refRegroupement varchar(50),
    @CodeMoyenReglement varchar(50),
    @montantAccompte decimal(18,3), -- Précision ajoutée par sécurité
    @compteAccompteId UNIQUEIDENTIFIER,
    @agenceBanqueId UNIQUEIDENTIFIER,
    @numeroCheque varchar(225) = NULL,
    @numeroCompte varchar(225) = NULL,
    @numeroEmetteur varchar(225) = NULL,
    @testAccompte INT = 0
AS
BEGIN
    SET NOCOUNT ON;

    -- ==========================================================================================
    -- ETAPE 1 : PREPARATION DES DONNEES DANS UNE TABLE TAMPON (JOINTS UNE SEULE FOIS)
    -- ==========================================================================================
    
    -- Structure exacte nécessaire pour la suite
    CREATE TABLE #LigneCompteEncaissable (
        gs2elignecompteclientId uniqueidentifier, 
        CreatedOn datetime,
        CreatedBy uniqueidentifier,
        ModifiedOn datetime,
        ModifiedBy uniqueidentifier,
        OwnerId uniqueidentifier,
        OwnerIdType int,
        OwningBusinessUnit uniqueidentifier,
        statecode int,
        statuscode int,
        gs2e_referencelignecompte varchar(225),
        gs2e_datedevaleur datetime,
        gs2e_Montantdelaligne decimal(18,3),
        TransactionCurrencyId uniqueidentifier,
        ExchangeRate decimal(18,10), -- Ajusté pour éviter perte précision
        gs2e_montantdelaligne_Base decimal(18,3),
        gs2e_numero_operation varchar(225),
        gs2e_Moyendereglementid uniqueidentifier,
        gs2e_Typelignecompteid uniqueidentifier,
        gs2e_Conventionclientid uniqueidentifier,
        gs2e_Conventionregroupementid uniqueidentifier,
        gs2e_jfa_facturesaphirid uniqueidentifier,
        gs2e_Lignedecompteparenteid uniqueidentifier,
        gs2e_typedereglementdo bit,
        gs2e_echeanceassocieeid uniqueidentifier,
        gs2e_soldeligneparent  decimal(18,3),
        gs2e_soldeligneparent_Base  decimal(18,3),
        gs2e_montantpenaliteht  decimal(18,3),
        gs2e_montantpenaliteht_Base  decimal(18,3),
        gs2e_montantpenalitetva  decimal(18,3),
        gs2e_montantpenalitetva_Base  decimal(18,3),
        gs2e_estcomptabilisabledo  int,
        gs2e_demandederemboursement uniqueidentifier,
        gs2e_selectionnRembdo bit,
        gs2e_reference_ligne_compte varchar(225),
        FullName varchar(225),
        gs2e_periode varchar(50),
        jfa_Referenceclient varchar(225),
        jfa_numerofacture varchar(225),
        gs2e_statutsaphir_avant_encaissement int,
        jfa_Contrat varchar(225)
    );

    -- Vérification si on doit exclure des factures
    DECLARE @FilterFactures BIT = 0;
    IF EXISTS (SELECT 1 FROM @FactureBordereauIds)
        SET @FilterFactures = 1;

    -- Insertion optimisée (Set-based)
    INSERT INTO #LigneCompteEncaissable
    SELECT 
        NEWID() AS gs2elignecompteclientId,
        GETDATE() AS CreatedOn,
        @ROWID_PERSONNE AS CreatedBy,
        GETDATE() AS ModifiedOn,
        @ROWID_PERSONNE AS ModifiedBy,
        @ROWID_PERSONNE AS OwnerId,
        l.OwnerIdType,
        @BUSINESSUNIT AS OwningBusinessUnit,
        l.statecode,
        l.statuscode,
        l.gs2e_referencelignecompte, 
        GETDATE() AS gs2e_datedevaleur,
        l.gs2e_Montantdelaligne,
        l.TransactionCurrencyId,
        l.ExchangeRate,
        l.gs2e_montantdelaligne_Base, 
        @Numero_Operation AS gs2e_numero_operation,
        @MoyenDeReglementId AS gs2e_Moyendereglementid,
        'C72A33B4-6AC3-47EE-A4B0-9EECDFE32ED0' AS gs2e_Typelignecompteid,
        l.gs2e_Conventionclientid,
        l.gs2e_Conventionregroupementid,
        l.gs2e_jfa_facturesaphirid, 
        l.gs2e_lignecompteclientid,
        1 AS gs2e_typedereglementdo,
        l.gs2e_echeanceassocieeid,
        0 AS gs2e_soldeligneparent,
        0 AS gs2e_soldeligneparent_Base,
        0 AS gs2e_montantpenaliteht,
        0 AS gs2e_montantpenaliteht_Base,
        0 AS gs2e_montantpenalitetva,
        0 AS gs2e_montantpenalitetva_Base,
        0 AS gs2e_estcomptabilisabledo,
        l.gs2e_demandederemboursement,
        l.gs2e_selectionnRembdo,
        l.gs2e_reference_ligne_compte,
        c.FullName,
        f.gs2e_periode,
        c.jfa_Referenceclient,
        f.jfa_numerofacture,
        f.jfa_StatutSAPHIR,
        f.jfa_Contrat
    FROM 
        [CIE_Lite_MSCRM]..gs2e_bordereauBase b WITH (NOLOCK)
        -- Jointure sur le TVP (Remplaçant le SplitString)
        INNER JOIN @BordereauIds ids ON ids.Id = b.gs2e_bordereauId
        INNER JOIN [CIE_Lite_MSCRM]..gs2e_facturesdubordereauBase fb WITH(NOLOCK) ON b.gs2e_bordereauId = fb.gs2e_bordereau
        INNER JOIN [CIE_Lite_MSCRM].dbo.jfa_facturesaphirBase f WITH(NOLOCK) ON fb.gs2e_facture = f.jfa_facturesaphirId
        INNER JOIN [CIE_Lite_MSCRM]..jfa_conventionfacturationBase cr WITH(NOLOCK) ON cr.jfa_conventionfacturationId = f.jfa_Conventionfacturation
        INNER JOIN [CIE_Lite_MSCRM].[dbo].ContractBase AS ct WITH (NOLOCK) ON ct.ContractId = f.jfa_Contrat
        INNER JOIN [CIE_Lite_MSCRM].dbo.AccountBase a WITH (NOLOCK) ON a.AccountId = cr.jfa_Regroupement
        INNER JOIN [CIE_Lite_MSCRM].dbo.ContactBase c WITH (NOLOCK) ON c.ContactId = cr.gs2e_Titulairedelaconvention
        -- Jointure ligne compte
        INNER JOIN [CIE_Lite_MSCRM].dbo.gs2e_lignecompteclientBase l WITH (NOLOCK) 
            ON l.gs2e_jfa_facturesaphirid = f.jfa_facturesaphirId 
            AND l.gs2e_Lignedecompteparenteid IS NULL
        -- Filtre exclusion factures (Optimisation logique)
        LEFT JOIN @FactureBordereauIds exclu ON exclu.Id = f.jfa_facturesaphirId
    WHERE 
        -- Logique: Si @FilterFactures est actif, on exclut ceux qui matchent (IS NULL). Sinon on prend tout.
        (@FilterFactures = 0 OR exclu.Id IS NULL)
        AND f.gs2e_montantnetapayer <> 0 
        AND f.jfa_StatutSAPHIR NOT IN (2, 5, 6, 99, 12, 98, 100, 101, 102, 15, 3, 301, 207, 203, 200) 
        AND f.gs2e_Soldefacture > 0 
        AND f.gs2e_soldefacture_Base > 0;

    PRINT 'Fin Préparation (Table temporaire peuplée)';

    -- ==========================================================================================
    -- ETAPE 2 : INSERTIONS DE MASSE (BULK INSERT)
    -- ==========================================================================================

    BEGIN TRANSACTION; -- Transaction explicite pour cohérence globale
    BEGIN TRY
        
        -- 2.1 Insertion Ligne Compte Client
        PRINT 'Insertion Lignes de comptes...';
        INSERT INTO [CIE_Lite_MSCRM].dbo.gs2e_lignecompteclientbase (
            gs2e_lignecompteclientId, CreatedOn, CreatedBy, ModifiedOn, ModifiedBy, OwnerId, OwnerIdType, OwningBusinessUnit, statecode, statuscode,
            gs2e_referencelignecompte, gs2e_datedevaleur, gs2e_Montantdelaligne, TransactionCurrencyId, ExchangeRate, gs2e_montantdelaligne_Base, 
            gs2e_numero_operation, gs2e_Moyendereglementid, gs2e_Typelignecompteid, gs2e_Conventionclientid, gs2e_Conventionregroupementid, 
            gs2e_jfa_facturesaphirid, gs2e_Lignedecompteparenteid, gs2e_typedereglementdo, gs2e_echeanceassocieeid, gs2e_soldeligneparent, 
            gs2e_soldeligneparent_Base, gs2e_montantpenaliteht, gs2e_montantpenaliteht_Base, gs2e_montantpenalitetva, gs2e_montantpenalitetva_Base, 
            gs2e_estcomptabilisabledo, gs2e_demandederemboursement, gs2e_selectionnRembdo, gs2e_reference_ligne_compte
        )
        SELECT 
            gs2elignecompteclientId, CreatedOn, CreatedBy, ModifiedOn, ModifiedBy, OwnerId, OwnerIdType, OwningBusinessUnit, statecode, statuscode,
            gs2e_referencelignecompte, gs2e_datedevaleur, gs2e_Montantdelaligne, TransactionCurrencyId, ExchangeRate, gs2e_montantdelaligne_Base, 
            gs2e_numero_operation, gs2e_Moyendereglementid, gs2e_Typelignecompteid, gs2e_Conventionclientid, gs2e_Conventionregroupementid, 
            gs2e_jfa_facturesaphirid, gs2e_Lignedecompteparenteid, gs2e_typedereglementdo, gs2e_echeanceassocieeid, gs2e_soldeligneparent, 
            gs2e_soldeligneparent_Base, gs2e_montantpenaliteht, gs2e_montantpenaliteht_Base, gs2e_montantpenalitetva, gs2e_montantpenalitetva_Base, 
            gs2e_estcomptabilisabledo, gs2e_demandederemboursement, gs2e_selectionnRembdo, gs2e_reference_ligne_compte
        FROM #LigneCompteEncaissable;

        -- 2.2 Insertion Détails Transactions
        PRINT 'Insertion Détails Transactions...';
        INSERT INTO [CIE_Lite_MSCRM].dbo.gs2e_detaildestransactionsBase (
            gs2e_detaildestransactionsId, CreatedOn, CreatedBy, ModifiedOn, ModifiedBy, OrganizationId, statecode, statuscode,
            gs2e_name, gs2e_Guidducompteclient, gs2e_Guidducomptederegroupement, gs2e_Montant, TransactionCurrencyId, ExchangeRate, 
            gs2e_montant_Base, gs2e_Montantfacture, gs2e_montantfacture_Base, gs2e_montantpenaliteht, gs2e_montantpenaliteht_Base, 
            gs2e_montantpenalitetva, gs2e_montantpenalitetva_Base, gs2e_Nomduclient, gs2e_nomemetteur, gs2e_Numerodecheque, 
            gs2e_Numerodecompte, gs2e_Numeroderecu, gs2e_Periodedefacturation, gs2e_Referenceclient, gs2e_Referencefacture, 
            gs2e_Sensdelatransaction, gs2e_Soldeexigible, gs2e_soldeexigible_Base, gs2e_Soldenonexigible, gs2e_soldenonexigible_Base, 
            gs2e_type_canal, gs2e_Typedetransaction, gs2e_prestataire, gs2e_Agencebancaire, gs2e_echeancierId, gs2e_Moyendereglementid, 
            gs2e_Transactionid, gs2e_Compteclient, gs2e_Comptederegroupement, gs2e_Factureid, gs2e_referencecontrat, 
            gs2e_uoclientid, gs2e_numero_envoi, gs2e_statutsaphir_avant_encaissement
        )
        SELECT 
            NEWID(), GETDATE(), CreatedBy, GETDATE(), ModifiedBy, @ORGANISATION, statecode, statuscode,
            NULL, -- gs2e_name
            gs2e_Conventionclientid, gs2e_Conventionregroupementid, gs2e_Montantdelaligne, TransactionCurrencyId, ExchangeRate,
            gs2e_Montantdelaligne, gs2e_Montantdelaligne, gs2e_Montantdelaligne, 0, 0,
            0, 0, FullName, @numeroEmetteur, @numeroCheque,
            @numeroCompte, @Numero_Operation, gs2e_periode, jfa_Referenceclient, jfa_numerofacture,
            0, 0, 0, 0, 0,
            0, 'RGL', NULL, 
            CASE WHEN @agenceBanqueId = '00000000-0000-0000-0000-000000000000' THEN NULL ELSE @agenceBanqueId END,
            gs2e_echeanceassocieeid, gs2e_Moyendereglementid, @TransactionId, gs2e_Conventionclientid, gs2e_Conventionregroupementid,
            gs2e_jfa_facturesaphirid, 
            (SELECT TOP 1 ct.jfa_Referencecontrat FROM [CIE_Lite_MSCRM].dbo.ContractBase ct WITH(NOLOCK) WHERE ct.ContractId = l.jfa_Contrat ORDER BY ct.createdon DESC),
            NULL, NULL, gs2e_statutsaphir_avant_encaissement
        FROM #LigneCompteEncaissable l;

        -- 2.3 Mise à jour des Factures
        PRINT 'Mise à jour Factures...';
        UPDATE f
        SET f.jfa_StatutSAPHIR = 2,
            f.gs2e_Datedereglement = GETDATE(),
            f.gs2e_Soldefacture = 0,
            f.gs2e_soldefacture_Base = 0,
            f.gs2e_SoldePenalite = 0,
            f.gs2e_SoldePenalite_Base = 0
        FROM #LigneCompteEncaissable l
        INNER JOIN [CIE_Lite_MSCRM].dbo.jfa_facturesaphirBase f ON l.gs2e_jfa_facturesaphirid = f.jfa_facturesaphirId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;

    -- ==========================================================================================
    -- ETAPE 3 : GESTION DE L'ACCOMPTE (Paiement Anticipé)
    -- ==========================================================================================
    
    IF (@montantAccompte > 0 AND @compteAccompteId <> '00000000-0000-0000-0000-000000000000' AND @testAccompte = 1)
    BEGIN
        PRINT 'Traitement Accompte...';
        
        -- Récupération d'un template (Méthode originale conservée mais simplifiée)
        DECLARE @TemplateLigne TABLE (
             OwnerId uniqueidentifier, OwnerIdType int, OwningBusinessUnit uniqueidentifier, statecode int, statuscode int, 
             TransactionCurrencyId uniqueidentifier, ExchangeRate decimal(18,10), gs2e_Typelignecompteid uniqueidentifier
        );

        INSERT INTO @TemplateLigne
        SELECT TOP 1 
            l.OwnerId, l.OwnerIdType, l.OwningBusinessUnit, l.statecode, l.statuscode, 
            l.TransactionCurrencyId, l.ExchangeRate, t.gs2e_typelignecompteId
        FROM [CIE_Lite_MSCRM]..gs2e_lignecompteclientBase l WITH(NOLOCK)
        INNER JOIN [CIE_Lite_MSCRM]..gs2e_typelignecompteBase t WITH(NOLOCK) ON t.gs2e_typelignecompteid = l.gs2e_Typelignecompteid 
        WHERE t.gs2e_Libelle = 'Paiement par avance' AND l.CreatedOn > '2021-06-01';

        -- Insertion Ligne Compte Accompte
        INSERT INTO [CIE_Lite_MSCRM].[dbo].[gs2e_lignecompteclientBase](
           gs2e_lignecompteclientId, CreatedOn, CreatedBy, OwnerId, OwnerIdType, OwningBusinessUnit, statecode, statuscode,
           gs2e_referencelignecompte, gs2e_numero_operation, gs2e_Montantdelaligne, TransactionCurrencyId, ExchangeRate, gs2e_montantdelaligne_Base,
           gs2e_montantht, gs2e_montantht_Base, gs2e_montantpenaliteht, gs2e_montantpenaliteht_Base, gs2e_montantpenalitetva, gs2e_montantpenalitetva_Base,
           gs2e_montanttva, gs2e_montanttva_Base, gs2e_Typelignecompteid, gs2e_Conventionregroupementid, gs2e_transactionid,
           gs2e_demandederemboursement, gs2e_estcomptabilisabledo, gs2e_selectionnRembdo, gs2e_typedereglementdo
        )
        SELECT 
           NEWID(), GETDATE(), @ROWID_PERSONNE, OwnerId, OwnerIdType, OwningBusinessUnit, statecode, statuscode,
           @Numero_Operation, @Numero_Operation, @montantAccompte, TransactionCurrencyId, ExchangeRate, @montantAccompte,
           0, 0, 0, 0, 0, 0, 
           0, 0, gs2e_Typelignecompteid, @compteAccompteId, @TransactionId,
           NULL, 0, 0, 1
        FROM @TemplateLigne;

        -- Insertion Détail Accompte
        -- (On utilise une logique similaire sans table temp complexe)
        INSERT INTO [CIE_Lite_MSCRM]..gs2e_detaildestransactionsBase(
           gs2e_detaildestransactionsId, CreatedOn, CreatedBy, ModifiedOn, OrganizationId, statecode, statuscode,
           gs2e_Guidducompteclient, gs2e_Guidducomptederegroupement, gs2e_Montant, TransactionCurrencyId, ExchangeRate, gs2e_montant_Base,
           gs2e_Montantfacture, gs2e_montantfacture_Base, gs2e_montantpenaliteht, gs2e_montantpenaliteht_Base, gs2e_montantpenalitetva, 
           gs2e_montantpenalitetva_Base, gs2e_Nomduclient, gs2e_nomemetteur, gs2e_Numerodecheque, gs2e_Numerodecompte, gs2e_Numeroderecu, 
           gs2e_Referenceclient, gs2e_Referencefacture, gs2e_Soldeexigible, gs2e_soldeexigible_Base, gs2e_Soldenonexigible, gs2e_soldenonexigible_Base,
           gs2e_Typedetransaction, gs2e_Agencebancaire, gs2e_Moyendereglementid, gs2e_Transactionid, gs2e_Compteclient, gs2e_Comptederegroupement,
           gs2e_referencecontrat
        )
        SELECT TOP 1
           NEWID(), GETDATE(), @ROWID_PERSONNE, GETDATE(), @ORGANISATION, d.statecode, d.statuscode,
           @compteAccompteId, @compteAccompteId, @montantAccompte, d.TransactionCurrencyId, d.ExchangeRate, @montantAccompte,
           0, 0, 0, 0, 0,
           0, (SELECT TOP 1 FullName FROM #LigneCompteEncaissable), @numeroEmetteur, @numeroCheque, @numeroCompte, @Numero_Operation,
           @refRegroupement, @Numero_Operation, 0, 0, 0, 0,
           'DEP', CASE WHEN @agenceBanqueId = '00000000-0000-0000-0000-000000000000' THEN NULL ELSE @agenceBanqueId END,
           @MoyenDeReglementId, @TransactionId, @compteAccompteId, @compteAccompteId,
           (SELECT TOP 1 ct.jfa_Referencecontrat FROM [CIE_Lite_MSCRM].dbo.ContractBase ct WITH(NOLOCK) WHERE ct.gs2e_Conventionfacturationid = @compteAccompteId ORDER BY ct.createdon DESC)
        FROM [CIE_Lite_MSCRM]..gs2e_detaildestransactionsBase d WITH(NOLOCK)
        WHERE d.gs2e_Typedetransaction = 'DEP' AND d.CreatedOn > '2021-06-01';

    END

    -- Nettoyage final
    DROP TABLE #LigneCompteEncaissable;
END
GO