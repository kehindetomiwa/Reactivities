using System;
using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<User>(options)
{
    public required DbSet<Activity> Activities { get; set; }
    public required DbSet<ActivityAttendee> ActivityAttendees { get; set; }

    public required DbSet<Photo> Photos { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ActivityAttendee>()
            .HasKey(aa => new { aa.UserId, aa.ActivityId });

        builder.Entity<ActivityAttendee>()
            .HasOne(aa => aa.User)
            .WithMany(u => u.Activities)
            .HasForeignKey(aa => aa.UserId);

        builder.Entity<ActivityAttendee>()
            .HasOne(aa => aa.Activity)
            .WithMany(a => a.Attendees)
            .HasForeignKey(aa => aa.ActivityId);
    }

}
