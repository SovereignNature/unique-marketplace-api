﻿using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Numerics;

namespace Marketplace.Db.Models
{
    [Table("QuoteOutgoingTransaction")]
    public class QuoteOutgoingTransaction
    {
        [Key]
        public Guid Id { get; set; }
        
        public ProcessingDataStatus Status { get; set; }

        public string? ErrorMessage { get; set; }
        
        public BigInteger Value { get; set; }
        
        public ulong QuoteId { get; set; }

        [Required]
        public string RecipientPublicKey { get; set; } = null!;
        
        public WithdrawType WithdrawType { get; set; }
        
        [NotMapped]
        public byte[] RecipientPublicKeyBytes
        {
            get => Convert.FromBase64String(RecipientPublicKey);
            set => RecipientPublicKey = Convert.ToBase64String(value);
        }

    }
}