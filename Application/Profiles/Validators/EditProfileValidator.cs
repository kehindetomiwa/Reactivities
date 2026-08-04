using System;
using Application.Profiles.Commands;
using FluentValidation;

namespace Application.Profiles.Validators;

public class EditProfileValidator : AbstractValidator<EditProfile.Command>
{
    public EditProfileValidator()
    {
        // Only DisplayName is validated - Bio is never collected at registration,
        // so it has to stay optional here.
        RuleFor(x => x.ProfileDto.DisplayName)
            .NotEmpty()
            .WithMessage("Display name is required");
    }
}
