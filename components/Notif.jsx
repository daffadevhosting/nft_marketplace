import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'

export default function Banner() {
  return (
<Alert status='warning' style={{borderRadius: '6px'}}>
  <AlertIcon />
  <AlertDescription>for best development please use your own smartcontracts.</AlertDescription>
</Alert>
  );
}
