<?php

namespace App\Services;

use App\Models\User;

class ProfileService {

    public function getDetails($userID) {
        try {
            $user = User::find($userID);

            if (!$user) {
                throw new \Exception('User not found.');
            }

            return [
                'success' => true,
                'user_data' => $user,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function updateDetails($userID, $name, $email) {
        try {
            $user = User::find($userID);

            if ($user) {
                $user->update([
                    'name' => $name,
                    'email' => $email,
                ]);
            } else {
                throw new \Exception('User does not exist.');
            }

            return [
                'success' => true,
                'user_data' => $user,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

}