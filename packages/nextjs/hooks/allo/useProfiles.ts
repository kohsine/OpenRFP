import { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { useAccount } from "wagmi";

export interface Profile {
  name: string | undefined;
  owner: string | undefined;
  profileId: `0x${string}` | undefined;
}

function mapProfiles(profiles: any[]) {
  return profiles?.map(profile => {
    return {
      name: profile.name,
      owner: profile.owner.id,
      members: profile.memberRole.accounts.map((account: any) => account.id),
      profileId: profile.id,
    };
  });
}

const GET_PROFILES = gql`
  query GetProfiles {
    profiles(first: 1000) {
      memberRole {
        accounts {
          account {
            id
          }
        }
      }
      id
      owner {
        id
      }
      name
    }
  }
`;

export const useProfiles = () => {
  const { address } = useAccount();
  const { data, refetch } = useQuery(GET_PROFILES);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userProfiles, setUserProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    if (data) {
      const profiles = mapProfiles(data.profiles);
      setProfiles(profiles);
      const userProfiles = profiles.filter(profile => profile.owner?.toLowerCase() === address?.toLowerCase());
      setUserProfiles(userProfiles);
    }
  }, [data, address]);

  return { profiles, userProfiles, setProfiles, setUserProfiles, refetch };
};
