# main/forms.py

from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from .models import UserProfile

class SignupForm(UserCreationForm):
    email = forms.EmailField(
        required=True, help_text='Required. Enter a valid email address.'
    )
    bio = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 3}), required=False, help_text='Tell us about yourself.'
    )
    profile_picture = forms.ImageField(required=False, help_text='Optional. Upload a profile picture.')

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password1', 'password2', 'bio', 'profile_picture'
        )

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
            # Update the existing UserProfile
            user_profile = user.userprofile
            user_profile.bio = self.cleaned_data['bio']
            user_profile.profile_picture = self.cleaned_data['profile_picture']
            user_profile.save()
        return user

class LoginForm(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={'autofocus': True}))
    password = forms.CharField(
        label=("Password"),
        strip=False,
        widget=forms.PasswordInput,
    )

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ('bio', 'profile_picture')
